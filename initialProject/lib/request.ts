export const apiPostRequest = async <Response = any>(url: string, payload: any) => {
  const returnAndLog = (response: Response) => {
    console.info(url, payload, response);
    return response;
  };

  const TIMEOUT_MS = 10000;
  const controller = new AbortController();
  const timeoutTimerID = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
  } catch (e: any) {
    if (e?.message == 'The user aborted a request.') return { status: 'timeout' as const };
    return returnAndLog({ status: 'request failed' as const, details: e?.message } as unknown as Response);
  }

  clearTimeout(timeoutTimerID);

  if (response.status != 200) {
    return returnAndLog({ status: 'request error' as const, details: 'statusCode' + response.status } as unknown as Response);
  }

  let data;
  try {
    data = await response.json();
  } catch (e: any) {
    return returnAndLog({ status: 'error parsing request' as const, details: e?.message } as unknown as Response);
  }
  if (!data || !data.status) return returnAndLog({ status: 'error parsing data' as const } as unknown as Response);

  return returnAndLog(data as Response);
};
