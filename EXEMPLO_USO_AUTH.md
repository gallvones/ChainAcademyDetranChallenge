# Como usar o Hook de Autenticação

O hook `useAuth` foi criado para verificar se o usuário está autenticado (se existe um ID no localStorage). Se não estiver, um modal de login é exibido automaticamente.

## Componentes Criados

1. **AuthModal** - Modal de login (`src/components/molecules/authModal/AuthModal.tsx`)
2. **useAuth** - Hook de autenticação (`src/hooks/useAuth.ts`)

## Como Usar

### Exemplo 1: Interceptar ação de botão

```tsx
"use client";

import { useAuth } from "@/hooks";
import { AuthModal } from "@/components/molecules/authModal";
import { Button } from "@/components/atoms/button";

export default function MinhaPage() {
  const { requireAuth, showAuthModal, closeAuthModal, isAuthenticated, userName } = useAuth();

  const handleProtectedAction = () => {
    // requireAuth() retorna false e abre o modal se não autenticado
    if (!requireAuth()) {
      return;
    }

    // Se chegou aqui, está autenticado - execute a ação
    console.log("Usuário autenticado! Executando ação...");
  };

  return (
    <div>
      <h1>Minha Página</h1>

      {isAuthenticated && <p>Bem-vindo, {userName}!</p>}

      <Button onClick={handleProtectedAction}>
        Fazer Proposta
      </Button>

      {/* Modal de autenticação */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onSuccess={() => {
          closeAuthModal();
          // Recarregar dados ou executar ação após login
          window.location.reload();
        }}
      />
    </div>
  );
}
```

### Exemplo 2: Verificar autenticação ao carregar a página

```tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks";
import { AuthModal } from "@/components/molecules/authModal";
import { useRouter } from "next/navigation";

export default function PaginaProtegida() {
  const router = useRouter();
  const { isAuthenticated, showAuthModal, closeAuthModal, openAuthModal } = useAuth();

  useEffect(() => {
    // Abre o modal se não estiver autenticado
    if (!isAuthenticated) {
      openAuthModal();
    }
  }, [isAuthenticated, openAuthModal]);

  return (
    <div>
      <h1>Página Protegida</h1>

      {isAuthenticated ? (
        <p>Conteúdo protegido aqui...</p>
      ) : (
        <p>Você precisa fazer login para acessar esta página.</p>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          closeAuthModal();
          router.push("/"); // Redireciona para home se fechar o modal
        }}
        onSuccess={() => {
          closeAuthModal();
          window.location.reload();
        }}
      />
    </div>
  );
}
```

### Exemplo 3: Botão de Logout

```tsx
"use client";

import { useAuth } from "@/hooks";
import { Button } from "@/components/atoms/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <Button onClick={handleLogout} variant="outline" icon={<LogOut />}>
      Sair
    </Button>
  );
}
```

## API do Hook

### Retorno do useAuth()

```typescript
{
  // Estado de autenticação
  isAuthenticated: boolean;        // true se usuário está logado

  // Dados do usuário
  userId: string | null;           // ID do usuário no localStorage
  userEmail: string | null;        // Email do usuário
  userName: string | null;         // Nome do usuário
  userRole: string | null;         // Role do usuário (owner, manager, customer)

  // Controle do modal
  showAuthModal: boolean;          // Estado de exibição do modal
  openAuthModal: () => void;       // Abre o modal de login
  closeAuthModal: () => void;      // Fecha o modal de login

  // Ações
  logout: () => void;              // Remove dados do localStorage e desloga
  requireAuth: () => boolean;      // Verifica auth - retorna false e abre modal se não autenticado
}
```

## Exemplo de Uso no CardCart

Para adicionar ao botão "Fazer proposta" no CardCart:

```tsx
// Adicionar no componente que usa o CardCart
const { requireAuth, showAuthModal, closeAuthModal } = useAuth();

<CardCart
  {...props}
  onClick={() => {
    if (!requireAuth()) return;
    // Continuar com a ação
    router.push(`/newproposal/${id}`);
  }}
/>

<AuthModal
  isOpen={showAuthModal}
  onClose={closeAuthModal}
  onSuccess={() => {
    closeAuthModal();
    router.push(`/newproposal/${id}`);
  }}
/>
```

## Notas Importantes

1. O hook verifica automaticamente o localStorage no mount
2. O modal só abre quando `requireAuth()` é chamado e o usuário não está autenticado
3. Após login bem-sucedido, chame `closeAuthModal()` e execute a ação desejada
4. Use `logout()` para deslogar o usuário
5. O hook é reativo a mudanças no localStorage (sincroniza entre abas)
