# FitLink Contentful fields

This is the field checklist for creating FitLink's two Contentful content types. Field IDs are case-sensitive and must match exactly.

The website reads published content from the Contentful Delivery API. Until Contentful is configured, FitLink displays the local “What Is FitLink?” article and S.P.E.A.R Fitness Expo event.

## 1. Blog content type

Create a content type named **Blog Post** with API ID **`blogPost`**. Set `title` as its entry title field.

| Field name | Field ID | Contentful type | Required | Validation/default |
| --- | --- | --- | --- | --- |
| Title | `title` | Short text | Yes | Maximum 120 characters |
| Slug | `slug` | Short text | Yes | Unique; slug format |
| Excerpt | `excerpt` | Long text | Yes | Maximum 240 characters |
| Body | `body` | Rich text | Yes | — |
| Cover image | `coverImage` | Media | Yes | One image |
| Author name | `authorName` | Short text | Yes | — |
| Author photo | `authorPhoto` | Media | No | One image |
| Category | `category` | Short text | Yes | `Company News`, `Fitness Tips`, `Training`, `Nutrition`, `Recovery`, `Mindset`, or `Workouts` |
| Published at | `publishedAt` | Date and time | Yes | — |
| Read time | `readTimeMinutes` | Integer | Yes | Minimum 1; maximum 60 |
| Featured | `featured` | Boolean | No | Default `false` |
| SEO title | `seoTitle` | Short text | No | Maximum 60 characters |
| SEO description | `seoDescription` | Long text | No | Maximum 160 characters |
| Tags | `tags` | Short text, list | No | — |

Published blog URLs use `/blog/{slug}`.

## 2. Event content type

Create a content type named **Event** with API ID **`event`**. Set `title` as its entry title field.

| Field name | Field ID | Contentful type | Required | Validation/default |
| --- | --- | --- | --- | --- |
| Title | `title` | Short text | Yes | Maximum 120 characters |
| Slug | `slug` | Short text | Yes | Unique; slug format |
| Excerpt | `excerpt` | Long text | Yes | Maximum 240 characters |
| Description | `description` | Rich text | Yes | — |
| Cover image | `coverImage` | Media | Conditional | One landscape image |
| Poster image | `posterImage` | Media | Conditional | One portrait image; recommended ratio approximately 0.70 width-to-height |
| Display image type | `displayImageType` | Short text | No | `Auto`, `Poster`, or `Cover`; default `Auto` |
| Gallery | `gallery` | Media, list | No | Images only; maximum 8 |
| Category | `category` | Short text | Yes | `Workout`, `Competition`, `Workshop`, `Wellness`, `Community`, or `Other` |
| Starts at | `startsAt` | Date and time | Yes | — |
| Ends at | `endsAt` | Date and time | No | Must be later than `startsAt` |
| Timezone | `timezone` | Short text | Yes | Default `Africa/Nairobi` |
| Venue name | `venueName` | Short text | Yes | — |
| Address | `address` | Long text | No | — |
| Town | `town` | Short text | Yes | — |
| County | `county` | Short text | Yes | — |
| Coordinates | `coordinates` | Location | No | — |
| Map URL | `mapUrl` | Short text | No | URL validation |
| Organiser name | `organizerName` | Short text | Yes | — |
| Organiser contact | `organizerContact` | Short text | No | — |
| Regular price | `priceKes` | Number | Yes | Minimum 0; use 0 for free |
| Activities | `activities` | Short text, list | No | Suggested maximum 20 |
| Pricing options | `pricingOptions` | Short text, list | No | Ordered display labels; suggested maximum 10 |
| Registration note | `registrationNote` | Long text | No | Maximum 400 characters; manual booking/payment instructions |
| Capacity | `capacity` | Integer | No | Minimum 1 |
| Registration URL | `registrationUrl` | Short text | No | URL validation |
| Registration deadline | `registrationDeadline` | Date and time | No | — |
| Related provider ID | `relatedProviderId` | Short text | No | — |
| Featured | `featured` | Boolean | No | Default `false` |
| Cancelled | `cancelled` | Boolean | No | Default `false` |

Every event must contain at least `posterImage` or `coverImage`. Contentful cannot enforce that cross-field rule, but the FitLink application validates it.

Image selection behavior:

- `Auto`: use the poster when available, otherwise use the cover.
- `Poster`: request the poster, falling back to the cover when missing.
- `Cover`: request the cover, falling back to the poster when missing.
- Posters are displayed completely without cropping and can be opened full-size.

Published event URLs use `/events/{slug}`. Only upcoming events appear in event listings and on the homepage. Set `cancelled` to `true` when an event should remain visible with a cancellation notice; unpublish it to remove it entirely.

## 3. Browser configuration

Create `.env` from `.env.example` and add:

```dotenv
VITE_CONTENTFUL_SPACE_ID=your-space-id
VITE_CONTENTFUL_ENVIRONMENT=master
VITE_CONTENTFUL_DELIVERY_TOKEN=your-read-only-delivery-token
VITE_CONTENTFUL_LOCALE=en-US
```

All `VITE_*` values are included in the public browser bundle. Use only a read-only Content Delivery token here. Never expose Contentful Preview or Management tokens.

## 4. Firebase Functions configuration

If Contentful is later proxied through Firebase Functions:

- Use `defineString` for `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ENVIRONMENT`.
- Use `defineSecret` for `CONTENTFUL_DELIVERY_TOKEN`, `CONTENTFUL_PREVIEW_TOKEN`, and `CONTENTFUL_MANAGEMENT_TOKEN`.
- Bind each secret only to the function that requires it.
- Require verified FitLink admin authentication for preview or content-management endpoints.
- Never return a Preview or Management token to the browser.

Secret setup commands:

```text
firebase functions:secrets:set CONTENTFUL_DELIVERY_TOKEN
firebase functions:secrets:set CONTENTFUL_PREVIEW_TOKEN
firebase functions:secrets:set CONTENTFUL_MANAGEMENT_TOKEN
```

Management and Preview tokens are not required for the current public website. Authors can create and publish entries through the Contentful Web App using only the Delivery API for website reads.

## 5. Publishing checklist

- Confirm the content type API ID and every field ID match this README.
- Complete every required field.
- Upload at least one event visual.
- Check event dates, timezone, location, price, deadline, and links.
- Preview portrait posters at mobile size so all poster text remains readable.
- Publish the entry and its linked media assets.
- Verify the blog at `/blog/{slug}` or event at `/events/{slug}`.
- Never commit real Contentful credentials to Git.

For architecture details and troubleshooting, also see `CONTENTFUL_SETUP.md`.
