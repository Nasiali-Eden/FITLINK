# FitLink Contentful setup

FitLink can read published blogs and events directly from Contentful's Delivery API. Until credentials are added, the app uses its local 300-word FitLink article and the FIT LINK S.P.E.A.R Fitness Expo. A CMS error also falls back safely.

## 1. Create the space and environment

1. In the Contentful Web App, create or select a space.
2. Use the `master` environment initially, or create another environment and record its ID.
3. Open **Settings → API keys** and create a Content Delivery API key.
4. Do not create or use a Management token for the current website workflow. Authors create and publish entries in the Contentful Web App.

## 2. Create content type `blogPost`

Use **blogPost** as the API identifier and add these fields exactly:

| Field ID | Type | Requirements and validation |
| --- | --- | --- |
| `title` | Short text | Required; maximum 120 characters |
| `slug` | Short text | Required; unique; slug format validation |
| `excerpt` | Long text | Required; maximum 240 characters |
| `body` | Rich text | Required |
| `coverImage` | Media | Required; one image only |
| `authorName` | Short text | Required |
| `authorPhoto` | Media | Optional; one image only |
| `category` | Short text | Required; enum: `Company News`, `Fitness Tips`, `Training`, `Nutrition`, `Recovery`, `Mindset`, `Workouts` |
| `publishedAt` | Date and time | Required |
| `readTimeMinutes` | Integer | Required; minimum 1, maximum 60 |
| `featured` | Boolean | Default `false` |
| `seoTitle` | Short text | Optional; maximum 60 characters |
| `seoDescription` | Long text | Optional; maximum 160 characters |
| `tags` | Short text, list | Optional |

Set `title` as the entry title field.

## 3. Create content type `event`

Use **event** as the API identifier and add:

| Field ID | Type | Requirements and validation |
| --- | --- | --- |
| `title` | Short text | Required; maximum 120 characters |
| `slug` | Short text | Required; unique; slug format validation |
| `excerpt` | Long text | Required; maximum 240 characters |
| `description` | Rich text | Required |
| `coverImage` | Media | Optional; one image only; use for landscape event artwork |
| `posterImage` | Media | Optional; one image only; recommended portrait or A-series artwork around a 0.70 width-to-height ratio |
| `displayImageType` | Short text | Optional; enum: `Auto`, `Poster`, `Cover`; default `Auto` |
| `gallery` | Media, list | Optional; images only; maximum 8 |
| `category` | Short text | Required; enum: `Workout`, `Competition`, `Workshop`, `Wellness`, `Community`, `Other` |
| `startsAt` | Date and time | Required |
| `endsAt` | Date and time | Optional |
| `timezone` | Short text | Required; default `Africa/Nairobi` |
| `venueName` | Short text | Required |
| `address` | Long text | Optional |
| `town` | Short text | Required |
| `county` | Short text | Required |
| `coordinates` | Location | Optional |
| `mapUrl` | Short text | Optional; URL validation |
| `organizerName` | Short text | Required |
| `organizerContact` | Short text | Optional |
| `priceKes` | Number | Required; minimum 0 |
| `activities` | Short text, list | Optional; suggested maximum 20 items |
| `pricingOptions` | Short text, list | Optional; ordered display-ready pricing labels; suggested maximum 10 items |
| `registrationNote` | Long text | Optional; maximum 400 characters; manual reservation or payment guidance when no `registrationUrl` is provided |
| `capacity` | Integer | Optional; minimum 1 |
| `registrationUrl` | Short text | Optional; URL validation |
| `registrationDeadline` | Date and time | Optional |
| `relatedProviderId` | Short text | Optional |
| `featured` | Boolean | Default `false` |
| `cancelled` | Boolean | Default `false` |

Set `title` as the entry title field. Every event must have at least one visual: `posterImage` or `coverImage`. Contentful cannot enforce this cross-field requirement, so the app validates it and safely falls back to local events if a CMS entry has neither. `Auto` prefers a poster when one is available; `Poster` and `Cover` request that format but safely use the other visual when the selected one is missing. Posters render fully visible without cropping and can be opened at full size.

Contentful also cannot express every date relationship, so editors must ensure `endsAt` is after `startsAt`. The app ignores an invalid end time and closes registration after its deadline. Use Contentful's own publish/unpublish state; do not add a duplicate `published` field.

## 4. Configure direct browser delivery

Copy `.env.example` to a local `.env` and fill in only these public delivery values:

```dotenv
VITE_CONTENTFUL_SPACE_ID=your-space-id
VITE_CONTENTFUL_ENVIRONMENT=master
VITE_CONTENTFUL_DELIVERY_TOKEN=your-read-only-delivery-token
VITE_CONTENTFUL_LOCALE=en-US
```

Every `VITE_*` value is embedded in the browser bundle and visible to visitors. Only a read-only Content Delivery token is acceptable. Never place Contentful Preview or Management tokens in Vite variables, source code, Firebase Hosting configuration, or Git.

## 5. Author and publish

1. Add media assets to Contentful.
2. Create a `blogPost` or `event`, complete every required field, and preview its values.
3. Check event dates, Kenya timezone, location, price, registration deadline, and links.
4. For an event, upload a poster, a cover image, or both, then choose the intended `displayImageType`. Keep key text inside the poster's safe area and preview it at mobile size.
5. Select **Publish**. Only published entries appear through the Delivery API.
6. Unpublish an entry to remove it. Use `cancelled` when an event should remain visible with a cancellation notice.

## Later: Firebase Functions proxy

A server proxy is recommended when preview tools, protected editorial workflows, caching, or stricter token isolation are introduced. Configure non-sensitive identifiers with Firebase parameter strings, and credentials with Secret Manager:

```js
import { defineSecret, defineString } from "firebase-functions/params";

const contentfulSpaceId = defineString("CONTENTFUL_SPACE_ID");
const contentfulEnvironment = defineString("CONTENTFUL_ENVIRONMENT");
const contentfulDeliveryToken = defineSecret("CONTENTFUL_DELIVERY_TOKEN");
const contentfulPreviewToken = defineSecret("CONTENTFUL_PREVIEW_TOKEN");
const contentfulManagementToken = defineSecret("CONTENTFUL_MANAGEMENT_TOKEN");
```

Example setup commands (replace placeholders interactively; do not commit values):

```text
firebase functions:secrets:set CONTENTFUL_DELIVERY_TOKEN
firebase functions:secrets:set CONTENTFUL_PREVIEW_TOKEN
firebase functions:secrets:set CONTENTFUL_MANAGEMENT_TOKEN
```

Set `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ENVIRONMENT` through Firebase parameter configuration when deploying. Bind each secret only to the function that uses it, for example `secrets: [contentfulDeliveryToken]`. Preview and management endpoints must require verified FitLink admin authentication. Never return either token to the browser. No management-token function is needed now because authors publish through the Contentful Web App.

Direct delivery is simpler and suitable for public published content, but exposes the read-only Delivery token and lets browsers call Contentful directly. A Functions proxy hides its token, centralises schema validation and caching, and can enforce auth, at the cost of an extra service and request hop.

## Verification checklist

- Both content types use the exact API IDs and field IDs above.
- A published blog opens at `/blog/{slug}` and its image resolves.
- `/events` shows only upcoming published events; an event opens at `/events/{slug}`.
- The homepage omits its events section when no upcoming event exists and uses a shimmer while the calendar resolves.
- Poster artwork is fully visible and opens at full size; cover artwork retains its landscape crop.
- An unpublished entry disappears; a cancelled event remains visible as cancelled.
- Removing one Contentful variable restores local fallback content without a broken page.
- No Preview or Management token appears in `.env`, the browser network panel, Git, or the built JavaScript.
