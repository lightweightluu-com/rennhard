import { lazy, Suspense } from "react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router";
import { Layout } from "../features/site/Layout";
import { About, Contact, Home, Legal, NotFound, Offer, Vehicles } from "../features/site/pages";

const AdminApp = lazy(() => import("../features/admin/AdminApp"));

/** Memory-Routing nur für eingebettete Vorschau-Hosts ohne eigene URL (VITE_MEMORY_ROUTER=1). */
const Router = import.meta.env.VITE_MEMORY_ROUTER ? MemoryRouter : BrowserRouter;

export function App() {
  return (
    <Router {...(import.meta.env.VITE_MEMORY_ROUTER ? {} : { basename: import.meta.env.BASE_URL })}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="angebot" element={<Offer />} />
          <Route path="occasionen" element={<Vehicles />} />
          <Route path="ueber-uns" element={<About />} />
          <Route path="kontakt" element={<Contact />} />
          <Route path="impressum" element={<Legal doc="imprint" />} />
          <Route path="datenschutz" element={<Legal doc="privacy" />} />
          <Route path="cookies" element={<Legal doc="cookies" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      </Routes>
    </Router>
  );
}
