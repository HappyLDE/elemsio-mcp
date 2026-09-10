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

Use canonical media references returned for the selected website. For an image, use semantic `img` or
`picture` structure, provide meaningful localized `alt` text when the image conveys information, and
include dimensions/loading behavior where appropriate. Decorative images should have intentionally
empty alt text only when that state is supported by the selected mutation path.

Markup V1 append cannot introduce arbitrary image URLs; replacement may only reuse URLs already in
the target section. In practice, import a safe structure, then use the supported inspected
image-reference mutation surface when one is exposed. If no tool can bind the new canonical media
reference to the desired element, report the missing MCP capability rather than injecting HTML.

Protected `ResourceAsset` uploads are a different, access-controlled content-delivery contract. Do
not use protected assets as public page media or expose their signed part URLs.
