import React from "react";
import { initializeWidget } from "@vikadata/widget-sdk";
import { CallInfo } from "./call/panel";
const VikaCall: React.FC = () => {
  return <CallInfo />;
};

initializeWidget(VikaCall, process.env.WIDGET_PACKAGE_ID);
