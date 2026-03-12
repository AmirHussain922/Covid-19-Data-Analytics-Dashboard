import { createMemoryRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { GlobalStatistics } from "./pages/GlobalStatistics";
import { CountryComparison } from "./pages/CountryComparison";
import { Trends } from "./pages/Trends";
import { HeatmapPage } from "./pages/HeatmapPage";
import { Reports } from "./pages/Reports";

export const router = createMemoryRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "global", Component: GlobalStatistics },
      { path: "comparison", Component: CountryComparison },
      { path: "trends", Component: Trends },
      { path: "heatmap", Component: HeatmapPage },
      { path: "reports", Component: Reports },
    ],
  },
]);
