import React from "react";
import TablePage from "./TablePage";

export default function Page({ params }) {
  return <TablePage params={params} />;
}

// Enable dynamic params for this route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
