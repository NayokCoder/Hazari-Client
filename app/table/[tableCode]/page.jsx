import { Table } from "lucide-react";
import React from "react";
import TablePage from "./TablePage";

const page = ({ params }) => {
  return (
    <div>
      <TablePage params={params} />
    </div>
  );
};

export default page;
