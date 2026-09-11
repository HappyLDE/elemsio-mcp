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
