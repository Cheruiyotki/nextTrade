import React, { useMemo, useState } from "https://cdn.jsdelivr.net/npm/react@18.3.1/+esm";
import { createRoot } from "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/client/+esm";
import htm from "https://cdn.jsdelivr.net/npm/htm@3.1.1/+esm";

const html = htm.bind(React.createElement);

export { React, createRoot, html, useMemo, useState };
