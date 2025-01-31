'use client';

import React, { ReactNode } from "react";

import { store } from "@/store/index";
import { Provider } from "react-redux";

export default function StoreProvider ({ children } : { children: ReactNode }) {
  return (
    <Provider store={store}>
        {children}
    </Provider>
  );
}


