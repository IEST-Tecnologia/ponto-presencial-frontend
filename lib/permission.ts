"use server";

import { cookies } from "next/headers";

interface PermissionPayload {
  scopes: string[];
  rsid: string;
  rsname: string;
}

const keycloak_id = process.env.AUTH_KEYCLOAK_ID;
const keycloak_url = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_URL;
const keycloak_realm = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_REALM;

export const verifyUserPermission = async (page: string): Promise<boolean> => {
  if (!keycloak_id || !keycloak_url || !keycloak_realm) {
    console.error("Alguma variável de ambiente não foi definida");
    return false;
  }

  const access_token = (await cookies()).get("access_token")?.value;

  if (keycloak_id && keycloak_url && keycloak_realm && access_token) {
    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
      permission: `${page}`,
      audience: keycloak_id,
      response_mode: "decision",
    });

    const res = await fetch(
      `${keycloak_url}/realms/${keycloak_realm}/protocol/openid-connect/token`,
      {
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!res.ok) {
      console.error(
        `erro na verificação de permissão para ${page}: ` + res.statusText
      );
      return false;
    }

    const json = await res.json();

    return json.result;
  } else {
    return false;
  }
};
