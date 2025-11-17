import { inject, Injectable, PLATFORM_ID, REQUEST_CONTEXT } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

type SeoParams = {
  title?: string;
  description?: string;
  path?: string; // e.g. '/'
  imageUrl?: string; // Absolute URL recommended for OG/Twitter
  locale?: string; // e.g. 'en_US'
};

// Narrow server request shape to avoid relying on DOM `Request` type in the server build.
type ServerRequest = {
  headers?: Record<string, string>;
  protocol?: string;
  url?: string;
  get?: (h: string) => string | undefined;
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleSrv = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  // Angular v20+: `@angular/ssr` no longer exports REQUEST. Use REQUEST_CONTEXT from core.
  // In default setups, this is a Fetch API Request; treat it in a narrow, SSR-safe way.
  private readonly requestContext = inject(REQUEST_CONTEXT, { optional: true }) as unknown;

  setMeta(params: SeoParams): void {
    const baseUrl = this.resolveBaseUrl();
    const url = this.joinUrl(baseUrl, params.path ?? this.currentPath());

    // Title
    if (params.title) {
      this.titleSrv.setTitle(params.title);
      this.meta.updateTag({ property: 'og:title', content: params.title });
      this.meta.updateTag({ name: 'twitter:title', content: params.title });
    }

    // Description
    if (params.description) {
      this.meta.updateTag({ name: 'description', content: params.description });
      this.meta.updateTag({ property: 'og:description', content: params.description });
      this.meta.updateTag({ name: 'twitter:description', content: params.description });
    }

    // Canonical
    this.setCanonical(url);

    // URL
    this.meta.updateTag({ property: 'og:url', content: url });

    // Image (optional)
    if (params.imageUrl) {
      this.meta.updateTag({ property: 'og:image', content: params.imageUrl });
      this.meta.updateTag({ name: 'twitter:image', content: params.imageUrl });
    }

    // Locale (optional)
    if (params.locale) {
      this.meta.updateTag({ property: 'og:locale', content: params.locale });
    }

    // Basic JSON-LD for WebSite/WebPage
    const jsonLd = this.createJsonLd(params.title, params.description, url);
    this.setJsonLd(jsonLd);
  }

  private resolveBaseUrl(): string {
    // Prefer SSR request data when available
    const urlFromSsr = this.getSsrRequestUrl();
    if (urlFromSsr) {
      return urlFromSsr.origin;
    }

    // Browser fallback
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }

    // Default fallback for build-time/unknown
    return 'https://example.com';
  }

  private currentPath(): string {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    const urlFromSsr = this.getSsrRequestUrl();
    if (urlFromSsr) {
      return urlFromSsr.pathname + urlFromSsr.search;
    }
    return '/';
  }

  /** Extract a URL from SSR request context when available. */
  private getSsrRequestUrl(): URL | undefined {
    const ctx = this.requestContext as unknown;
    if (!ctx) return undefined;

    // Case 1: Fetch API Request (typical in Angular SSR runtime)
    const maybeReq = ctx as { url?: string | URL; headers?: { get(name: string): string | null } };
    if (maybeReq && typeof maybeReq === 'object' && maybeReq.url) {
      try {
        const url = typeof maybeReq.url === 'string' ? new URL(maybeReq.url) : maybeReq.url;
        return url instanceof URL ? url : undefined;
      } catch {
        // ignore
      }
    }

    // Case 2: Nested request in context object (e.g., { request: Request })
    const nested = ctx as { request?: { url?: string | URL } };
    if (nested && typeof nested === 'object' && nested.request?.url) {
      try {
        const url = typeof nested.request.url === 'string' ? new URL(nested.request.url) : nested.request.url;
        return url instanceof URL ? url : undefined;
      } catch {
        // ignore
      }
    }

    // Case 3: Legacy/adapter-like shape
    const legacy = ctx as ServerRequest;
    if (legacy && typeof legacy === 'object' && typeof legacy.url === 'string') {
      try {
        return new URL(legacy.url, this.legacyBaseFromHeaders(legacy));
      } catch {
        // ignore
      }
    }

    return undefined;
  }

  private legacyBaseFromHeaders(req: ServerRequest): string {
    const headers = req.headers ?? {};
    const getHeader = (name: string): string | undefined => {
      if (typeof req.get === 'function') return req.get(name);
      return headers[name.toLowerCase()];
    };
    const proto = getHeader('x-forwarded-proto') || (req as any).protocol || 'https';
    const host = getHeader('x-forwarded-host') || getHeader('host') || 'example.com';
    return `${proto}://${host}`;
  }

  private joinUrl(base: string, path: string): string {
    if (!path.startsWith('/')) return `${base}/${path}`;
    return `${base}${path}`;
  }

  private setCanonical(url: string): void {
    const head = this.doc.head as HTMLHeadElement;
    if (!head) return;
    let link: HTMLLinkElement | null = head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(json: unknown): void {
    const head = this.doc.head as HTMLHeadElement;
    if (!head) return;
    // Remove existing
    const existing = head.querySelector('#ld-json');
    if (existing) existing.remove();
    // Add script
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-json';
    script.text = JSON.stringify(json);
    head.appendChild(script);
  }

  private createJsonLd(title?: string, description?: string, url?: string): unknown {
    const now = new Date().toISOString();
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title ?? 'Nano Studio',
      description: description ?? 'AI-powered image editing',
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Nano Studio',
        url: url ? new URL('/', url).toString() : undefined
      },
      dateModified: now
    };
  }
}
