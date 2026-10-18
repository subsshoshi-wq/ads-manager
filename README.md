# Ads Manager simulation

A screenshot-inspired advertising dashboard with a form-based admin panel. This is an independent local simulation, not affiliated with Meta, and never serves or purchases real ads.

Requires Node.js 20 or newer. No external dependencies, credentials, or database are required.

```sh
npm start
npm test
```

The server listens on port 3000 (`PORT` overrides it). Open the app in a browser. Choose **Admin panel → Add ad** to enter ad details. Edit or delete entries in the admin panel; use dashboard switches to change delivery, checkboxes to edit or duplicate, and search/filter buttons to find ads. Report metrics are calculated from the entered values.

Data is stored in the current browser's localStorage. The initial 16 sample ads can be edited or deleted. Export/import a JSON backup in the admin panel; export the current report as CSV from the dashboard. “Publish” only marks local draft records as published in the simulation.

The admin panel is not authenticated and data is not shared between browsers. A production multi-user deployment would need backend storage and authentication. The three hierarchy tabs currently display the same ad records with different labels. Date selection, report breakdowns and A/B experiments are explanatory demo controls. Fonts use Segoe UI with system fallbacks, so rendering varies by platform.

## Export PDF results

Click **Export PDF** in the dashboard toolbar. The report includes ads matching the current search and delivery filter; if rows are selected, it includes only selected visible ads. A report tab opens with the ads table and all result metrics. In the browser print dialog choose **Save as PDF**, use **Landscape**, turn off **Headers and footers** to hide browser-added dates and titles, and save. If automatic printing is blocked, click **Print / Save as PDF** in the report. Allow pop-ups if prompted. Reports clearly identify manually entered simulation data; missing metrics show a dash. No ad data is sent to an external PDF service.
