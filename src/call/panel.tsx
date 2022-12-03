import { useRecords, useSelection, useActiveViewId, useCollaborators, useDatasheet, useFields, useCloudStorage } from "@vikadata/widget-sdk";
import React, { useState } from "react";
import { Button, Space, Loading, Select } from "@vikadata/components";
import styles from "./style.css";
import { PhoneCall, initCloudCall, isObjectContainEmpty } from "../utils";
import { userIds } from "../dict/users";
interface IPabel {
  phone: string;
  contact: string;
  company: string;
  recordId: string;
}
interface IField {
  PHONE: string;
  CONTACT: string;
  COMPANY: string;
}

let cacheValue: IPabel = { phone: "", contact: "", company: "", recordId: "" };
export const CallInfo: React.FC = () => {
  const viewId = useActiveViewId();
  const selection = useSelection();
  const collaborators = useCollaborators();
  const currentUser = collaborators[0];
  const [isLoading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isOnline, setOnline] = useState(false);
  const [isConnected, setConnect] = useState(false);
  const [callError, setCallError] = useState("");
  const [isCalling, setCalling] = useState(false);
  const datasheet = useDatasheet();
  const fields = useFields(viewId);
  const [fieldDict, setFieldDict] = useCloudStorage(datasheet.id, {} as IField);
  const selectOptions = fields.map((f) => {
    return {
      label: f.name,
      value: f.id,
    };
  });
  // 获取当前登录用户
  const currentUserId = userIds.find((u) => u.name === currentUser?.name)?.id;

  const records = useRecords(viewId, { ids: selection?.recordIds });
  function getCellValueByID() {
    const value = {
      phone: records?.[0]?.getCellValueString(fieldDict.PHONE),
      contact: records?.[0]?.getCellValueString(fieldDict.CONTACT),
      company: records?.[0]?.getCellValueString(fieldDict.COMPANY),
      recordId: selection?.recordIds?.[0],
    };
    const hasEmpty = isObjectContainEmpty(value);
    if (!hasEmpty) {
      cacheValue = value;
    } else if (selection?.recordIds?.[0]) {
      cacheValue = { phone: "", contact: "", company: "", recordId: "" };
    }
    return cacheValue;
  }
  function onPhoneCall() {
    const phoneNumber = cacheValue.phone;
    const sheetId = datasheet.datasheetId;
    const recordId = cacheValue.recordId;
    console.log("phone", phoneNumber);
    console.log(`${sheetId}/${recordId}`);
    window.tccc.on(window.tccc.events.sessionEnded, (response) => {
      setCalling(false);
      // 外呼结束时执行
    });
    setCalling(true);
    PhoneCall({ phoneNumber, recordId: cacheValue.recordId, sheetId })
      .then(() => {
        setCallError("");
      })
      .catch((err) => {
        setCalling(false);
        setCallError(err);
      });
  }
  // 设置客服在线状态
  function onSeatStatusChange() {
    setBtnLoading(true);
    setCallError("");
    if (isOnline) {
      window.tccc.Agent.offline();
    } else {
      window.tccc.Agent.online();
    }
  }
  // 初始化云呼叫中心sdk
  async function initCall() {
    setLoading(true);
    try {
      await initCloudCall(currentUserId);
      setLoading(false);
      setOnline(true);
      setConnect(true);
    } catch (err: any) {
      setCallError(err);
    }
  }
  // 监听坐席状态
  window?.tccc?.on(window?.tccc?.events?.statusChanged, function (options) {
    console.log("options::::::", options);
    setBtnLoading(false);
    if (options.status === "offline") {
      setOnline(false);
    } else {
      setOnline(true);
    }
  });
  function SeatStatus() {
    if (callError) {
      return <span style={{ color: "red" }}>异常</span>;
    } else if (isLoading) {
      return (
        <div className={styles.loading}>
          <Loading />
          <span style={{ marginLeft: 5 }}>正在初始化...</span>
        </div>
      );
    } else if (isOnline) {
      return <b style={{ color: "green" }}>在线</b>;
    }
    return <b>已下线</b>;
  }
  React.useEffect(() => {
    cacheValue = { phone: "", contact: "", company: "", recordId: "" };
    setLoading(true);
    // initCall();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.status}>
        当前状态：
        <SeatStatus />
      </div>
      <div className={styles["user-info"]}>
        <span>
          当前用户：<b>{currentUser?.name}</b>
        </span>
        <span>
          用户ID：<b>{currentUserId || <span style={{ color: "red" }}>userId未匹配</span>}</b>
        </span>
      </div>
      <div className={styles["info-sec"]}>
        <div className={styles.info}>
          <span className={styles.label}>
            <Select
              placeholder="请选择公司字段"
              options={selectOptions}
              value={fieldDict.COMPANY}
              onSelected={(option) => setFieldDict({ ...fieldDict, ["COMPANY"]: option.value })}
            />
          </span>
          <span className={styles["value"]}>{getCellValueByID().company}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.label}>
            <Select
              placeholder="请选择联系人字段"
              options={selectOptions}
              value={fieldDict.CONTACT}
              onSelected={(option) => setFieldDict({ ...fieldDict, ["CONTACT"]: option.value })}
            />
          </span>
          <span className={styles.value}>{getCellValueByID().contact}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.label}>
            <Select
              placeholder="请选择手机字段"
              options={selectOptions}
              value={fieldDict.PHONE}
              onSelected={(option) => setFieldDict({ ...fieldDict, ["PHONE"]: option.value })}
            />
          </span>
          <span className={styles.value}>{getCellValueByID().phone}</span>
        </div>
      </div>
      <div className={styles.button}>
        <Space size={12}>
          <Button
            style={{ width: 100, marginRight: 10 }}
            variant="fill"
            disabled={!cacheValue.phone || !currentUserId || isLoading || !isConnected || !isOnline || isCalling}
            color="#519d32"
            onClick={onPhoneCall}
          >
            拨打电话
          </Button>
          <Button
            loading={btnLoading}
            style={{ width: 100 }}
            variant="fill"
            disabled={!currentUserId || !isConnected || isCalling}
            color="primary"
            onClick={onSeatStatusChange}
          >
            {isOnline ? "下线" : "上线"}
          </Button>
        </Space>
        <div style={{ color: "red", marginTop: 15, textAlign: "center" }}>{callError}</div>
      </div>
    </div>
  );
};
