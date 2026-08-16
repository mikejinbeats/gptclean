# Plano de Resolução e Implementação: ChatGPT Clean & Power

Este documento responde a todas as tuas questões e detalha o plano exato de implementação para cada funcionalidade solicitada.

---

## 1. Funcionamento Real do Bloqueador & Contador de Anúncios

* **Dúvida:** *"Eu acho que ele inventa o número de anúncios bloqueados... O bloquear anúncios quando ativo ou desativo funciona mesmo?"*
* **Explicação & Solução:**
  * O contador **NÃO inventa números**. Ele só soma `+1` quando o script localiza e elimina fisicamente um elemento HTML com rótulos de anúncio (`[data-testid*="ad"]`, `[aria-label*="sponsored" i]`, links da Microsoft Ads/OpenAI Ads).
  * Se a tua conta ou sessão atual ainda não tiver recebido anúncios da OpenAI, o número mantém-se a **`0`**.
  * **O que vamos melhorar:** Quando desligas o interruptor no popup, o script desativa de imediato o `MutationObserver` e desliga as regras de CSS, permitindo que a página volte ao estado 100% original.

---

## 2. Exportação Multi-Formato (PDF, Word .doc e Markdown .md) + Trial de 1 Mês Grátis

* **Dúvida:** *"O exportar conversa deveria ter para PDF, doc Word ou .md ao clicar para selecionar + o botão de exportar conversa deve ser 1 mês grátis apenas"*
* **Como vai funcionar:**
  1. Ao clicares em **"📥 Exportar"** (abaixo de cada resposta), abre um menu elegante com 3 opções:
     * 📄 **PDF Formatado:** Abre janela de impressão/PDF limpa sem anúncios nem botões residuais.
     * 📝 **Word (.doc):** Descarrega um ficheiro compatível com Microsoft Word e Google Docs com cabeçalhos e formatação.
     * 📑 **Markdown (.md):** Descarrega ficheiro `.md` limpo para Notion, Obsidian ou código.
  2. **Sistema de Trial de 1 Mês (30 Dias Grátis):**
     * Na primeira vez que a extensão corre, regista a data de início no `chrome.storage.local`.
     * Durante **30 dias**, a exportação é **100% grátis e ilimitada**, mostrando no popup: `🎁 Trial Grátis: X dias restantes`.
     * Ao fim de 30 dias, se o utilizador não tiver o plano PRO, ao clicar em Exportar surge um modal simpático a convidar para desbloquear a versão vitalícia (2,99€).

---

## 3. Prompts Rápidos: O que era suposto fazerem?

* **Dúvida:** *"Quando clico num prompt rápido ele seleciona, mas não faz nada... Era suposto fazer o quê?"*
* **Comportamento Corrigido:**
  1. **Dentro do ChatGPT (Botão `⚡` junto à caixa de envio):** Ao clicares no prompt, ele **preenche instantaneamente o campo de texto do ChatGPT** (`#prompt-textarea`) e coloca o cursor no fim para poderes enviar logo.
  2. **No Popup da Extensão:** Ao clicares no prompt, ele:
     * Copia o texto para a área de transferência (*clipboard*).
     * Exibe um aviso visual claro: `"✅ Copiado! Pressione Ctrl+V no ChatGPT"`.
     * Se tiveres o ChatGPT aberto noutro separador, injeta o texto diretamente nesse separador automaticamente.

---

## 4. Seletor de Temas (Padrão, AMOLED Black #000000 e Clean Light Branco)

* **Dúvida:** *"Modo AMOLED está para selecionar fundo preto, mas fundo preto já ele tem... Você tem de criar ele branco também"*
* **Explicação & Solução:**
  * O ChatGPT por defeito tem um cinzento escuro (`#212121`). O AMOLED é preto absoluto (`#000000`) para ecrãs OLED.
  * Vamos criar um **Seletor de 3 Temas** na aba Ferramentas do Popup:
    * ⚙️ **Padrão:** O tema original do ChatGPT.
    * 🌙 **AMOLED Black (#000000):** Preto puro, ideal para poupar bateria e descansar a visão.
    * ☀️ **Clean Light (Branco):** Tema claro minimalista com alto contraste, fundo branco limpo e bordas refinadas.

---

## 5. Pastas na Barra Lateral do ChatGPT

* **Dúvida:** *"As pastas na barra lateral você ative para eu ver como é..."*
* **Como vai funcionar na prática:**
  * Ativamos o gestor de pastas diretamente na barra lateral esquerda do ChatGPT.
  * Surge um bloco no topo da lista de conversas: **"📁 Pastas [+ Nova Pasta]"**.
  * Podes criar pastas (ex.: *"Trabalho"*, *"Ideias"*, *"Estudos"*), recolher/expandir pastas e organizar conversas lá dentro.

---

## Resumo dos Ficheiros a Atualizar:

1. **`content.js`**: Injeção do menu com 3 formatos de exportação (PDF, Word, MD), injeção das pastas na barra lateral, preenchimento automático do `#prompt-textarea` ao escolher prompts, e aplicação dos temas AMOLED e Branco.
2. **`styles.css`**: Estilos para o menu de exportação, pastas na barra lateral e regras CSS completas para os temas Branco e AMOLED.
3. **`popup.html`**: Seletor de 3 temas, badge do contador de 30 dias de trial, e ativação das pastas.
4. **`popup.js`**: Lógica da contagem de 30 dias do trial, envio do prompt para a aba ativa do ChatGPT e controlo de temas.
5. **`popup.css`**: Design refinado dos novos seletores e alertas visuais.
