import { NextResponse } from "next/server";
import { serviceNow, type TableResponse } from "@/lib";

interface SysUser {
  sys_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const data = await serviceNow.get<TableResponse<SysUser[]>>(
      "/api/now/table/sys_user" +
        `?sysparm_query=email=${encodeURIComponent(email)}` +
        "&sysparm_fields=sys_id,email,first_name,last_name" +
        "&sysparm_limit=1"
    );

    const user = data.result[0];
    const jorgeId = process.env.JORGE_SYS_ID;

    if (!user || (jorgeId && user.sys_id !== jorgeId)) {
      return NextResponse.json({ error: "Credenciais incorretas" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.sys_id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: "buyer",
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 });
  }
}
