# ELEMS Media

Load this resource when a website needs hosted images or files. Published pages must not reference
arbitrary local filesystem paths, temporary chat URLs, or upload-session URLs.

## Discover and upload

Use `elems_list_media` to find existing same-website Media Library items. Results contain safe media
IDs, names, MIME types, sizes, and canonical public URLs.

The canonical upload flow is:

```text
inspect exact local filename, MIME type, and byte length
-> elems_prepare_media_upload
-> PUT the exact bytes directly to upload_url with every required_headers entry
-> elems_finalize_media_upload(upload_id)
-> use the returned MediaItem ID/canonical URL
```

File bytes travel directly to the short-lived signed upload target, not through MCP. Do not log or
persist that URL. Finalization verifies stored size, MIME, and content, then materializes exactly one
website-scoped MediaItem. Repeated finalization is idempotent. Raster images receive the established
original (maximum 2000px), 600px, and 200px variants where applicable.

Current direct-upload formats are JPEG, PNG, WebP, GIF, SVG, PDF, Word, Excel, and PowerPoint. Images
are normally capped at 50 MB and documents at 100 MB, subject to stricter server configuration.
Audio and video are not accepted by the current public Media upload allowlist. Do not imply that MP3
or video upload is supported. Existing safe HTTPS audio/video can be used only through a capability
that actually accepts it, such as a guarded passive HTML Embed; it is not converted into ELEMS Media.

## Use in elements

Use the exact canonical `url`, `url_200`, or `url_600` returned for the selected website as the
mutation-ready image `src`; agents do not construct CDN or storage paths. The server checks that the
URL resolves to a created image in that same website's Media Library. For an image, use semantic `img` or
`picture` structure, provide meaningful localized `alt` text when the image conveys information, and
include dimensions/loading behavior where appropriate. Decorative images should have intentionally
empty alt text only when that state is supported by the selected mutation path.

For an existing eligible `img`, inspect its `attribute:src` and localized `attribute:alt` targets and
use `elems_update_element` with their exact current values/hashes. For a new image, include the
same-website Media URL in canonical Markup V1 and use normal section import or narrow page/template
insertion with the relevant structural CAS. Arbitrary external, missing, non-image, cross-website,
non-HTTPS, executable, and upload-session URLs remain rejected.

Canonical workflow:

```text
elems_list_media or finalize upload -> retain exact canonical image URL
-> inspect image target or structural parent -> mutate src/alt or validate and insert img
-> inspect again -> regenerate/preview draft -> browser QA
```

Protected `ResourceAsset` uploads are a different, access-controlled content-delivery contract. Do
not use protected assets as public page media or expose their signed part URLs.

## Website favicon / site icon

Favicon is Website identity, independent from Page OG/social Media, header/footer logos,
Product images and Course covers. MCP does not generate imagery or transform an image.
Use existing canonical public Website Media (`elems_list_media`) or the normal signed upload flow.
Protected ResourceAssets, foreign Website/Entity Media and external arbitrary URLs are ineligible.

Read `elems_get_context.favicon`: `contract_version=website-favicon.v1`, `media_id`, `configured`,
`effective_state` (`configured`, `unconfigured`, `unavailable`), `source`, `favicon_hash`,
`media` (ID, canonical public URL, MIME, width, height, derivative URLs), and
`effective_at=immediate`. Unavailable references expose no usable URL. `source=legacy_template`
means the Website has never been explicitly managed; existing compiled Template browser icons
may still apply. This readback does not claim to inspect legacy Template HTML.

Call `elems_set_website_favicon` with `website_id`, fresh `expected_favicon_hash`, and `media_id`.
A positive ID sets/replaces the favicon; `null` explicitly clears it. No arbitrary Website fields
are accepted. Every change becomes effective on the next Runtime render, including every locale,
without Page or Template publication. `publish_performed=false` does not imply a draft: this is
an immediate Website setting. Same-value retries return `already_current`; stale conflicting
writes return CONFLICT. Read again before another change. A monotonically increasing Website
favicon revision protects against concurrent conflicts and A→B→A stale edits.

Supported types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`. The existing public object
must match its canonical Media extension/MIME and decode successfully; SVG active/external content
is rejected. ICO (`image/x-icon`, `image/vnd.microsoft.icon`) is browser compatible, but this contract
rejects it because ELEMS currently lacks validated ICO public Media processing. GIF and all other
MIME types are also outside this bounded contract. PNG is recommended for broad compatibility; a
small, legible icon with transparency and a square canvas, commonly 32×32 or 48×48, works well.
Square dimensions are recommendations, never requirements. Source dimensions/aspect ratio are
preserved; association performs no resize, conversion, duplication or upload.

Runtime emits one `<link rel="icon" href="CANONICAL_PUBLIC_MEDIA_URL" type="MIME">`. SVG adds
`sizes="any"`; raster sizes are omitted. An explicitly managed Website takes precedence over
legacy `icon` / `shortcut icon` links; clear removes them. Touch icons, mask icons and PWA manifests
are preserved. Websites never managed by this operation keep their existing Template declarations
and receive no forced ELEMS logo. Website data and Media eligibility are read each request; no
compiled Page republish or broad cache flush is required. Browser image caching may retain the
same URL; replacing Media uses its different canonical URL. Clear returns HTML without the old icon.

Clear or replace a current favicon before deleting its public Media. Canonical Website retirement
removes Website/Media state through the existing lifecycle, including public objects.

Standards references: [HTML icon relation](https://html.spec.whatwg.org/multipage/links.html#rel-icon),
[browser image formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types).
