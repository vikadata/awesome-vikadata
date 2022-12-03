export * from "./call";
export function isObjectContainEmpty(obj) {
  if (!obj["contact"] && !obj["phone"] && !obj["company"]) {
    return true;
  }
  return false;
}
