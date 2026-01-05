export function pickId(obj: any): string | undefined {
  return obj?.id || obj?._id;
}
