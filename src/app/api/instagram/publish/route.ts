export async function POST(request: Request) {
  let body: {
    igUserId?: string;
    accessToken?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  // Tokens from the browser are never accepted — old clients used to send them.
  if (body.accessToken || body.igUserId) {
    return Response.json(
      {
        ok: false,
        error: "Токени з клієнта не приймаються. Завантаж PNG або поділись з телефона.",
      },
      { status: 400 },
    );
  }

  return Response.json(
    {
      ok: false,
      error:
        "Пряма публікація в Instagram зʼявиться після входу через Meta. Зараз завантаж PNG або поділись з телефона.",
    },
    { status: 401 },
  );
}
