# Ads Manager simulation

A screenshot-inspired advertising dashboard with a form-based admin panel. This is an independent local simulation, not affiliated with Meta, and never serves or purchases real ads.

Requires Node.js 20 or newer. No external dependencies, credentials, or database are required.

```sh
npm start
npm test
```

The server listens on port 3000 (`PORT` overrides it). Open the app in a browser. Choose **Admin panel → Add ad** to enter ad details. Edit or delete entries in the admin panel; use dashboard switches to change delivery, checkboxes to edit or duplicate, and search/filter buttons to find ads. Report metrics are calculated from the entered values.

Data is stored in the current browser's localStorage. The 13 supplied Instagram ads can be edited or deleted. Export/import a JSON backup in the admin panel; export the current report as CSV from the dashboard. “Publish” only marks local draft records as published in the simulation.

The admin panel is not authenticated and data is not shared between browsers. A production multi-user deployment would need backend storage and authentication. The three hierarchy tabs currently display the same ad records with different labels. Date selection, report breakdowns and A/B experiments are explanatory demo controls. Fonts use Segoe UI with system fallbacks, so rendering varies by platform.

## Export PDF results

Click **Export PDF** in the dashboard toolbar. The report includes ads matching the current search and delivery filter; if rows are selected, it includes only selected visible ads. A report tab opens with the ads table and all result metrics. In the browser print dialog choose **Save as PDF**, use **Landscape**, turn off **Headers and footers** to hide browser-added dates and titles, and save. If automatic printing is blocked, click **Print / Save as PDF** in the report. Allow pop-ups if prompted. Reports clearly identify manually entered simulation data; missing metrics show a dash. No ad data is sent to an external PDF service.

## October Instagram dataset

The October replacement is installed once per browser; the previous list is retained under the localStorage backup key `ads-manager-demo-v1-before-instagram-october-200-v1`. Later edits and deletions are preserved on refresh.

- October 2–8: six completed messaging ads, $200 spent, $200 lifetime group budget.
- October 9–15: four completed messaging ads, $200 spent, $200 lifetime group budget.
- October 16–22: three active messaging ads, $200 lifetime group budget. Estimated spend is $85.71 through October 18 (three full days out of seven). This is a fixed snapshot, not a live spend counter.

Budgets are divided equally, assigning leftover cents to the first ads so each group totals exactly $200. Message counts are simulated at approximately $0.25 each, with whole-message rounding. Reach and impressions remain unspecified. Instagram links identify the supplied posts; captions and media have not been fetched. The same post appearing in two groups remains two separate ads. Lifetime budgets avoid misleading daily rounding ($200 / 7 is approximately $28.57 per group per day).
