/**
 * ChatGPT Clean & Power - Content Script Completo
 * Bloqueio de anúncios, Modal de Exportação com 3 opções (PDF/Word/MD),
 * pastas na barra lateral e injeção de prompts.
 */

(() => {
  'use strict';

  let state = {
    adBlockEnabled: true,
    exportBtnEnabled: true,
    foldersEnabled: true,
    promptsEnabled: true,
    isPro: false,
    exportTrialStartDate: null,
    customPrompts: [],
    folders: [
      { id: 'f1', name: '💼 Trabalho', count: 3 },
      { id: 'f2', name: '💡 Ideias', count: 5 },
      { id: 'f3', name: '📚 Estudos', count: 2 }
    ]
  };

  const DEFAULT_PROMPTS = [
    {
      title: "⚡ Resumir em Bullet Points",
      text: "Por favor, resume o texto anterior em tópicos claros, diretos e objetivos (bullet points), destacando apenas os pontos mais importantes."
    },
    {
      title: "✍️ Melhorar e Corrigir Texto",
      text: "Revê e melhora o seguinte texto, corrigindo erros gramaticais e tornando a linguagem mais fluida e profissional:\n\n"
    },
    {
      title: "💻 Explicar Código Passo a Passo",
      text: "Analisa o código abaixo e explica linha por linha como funciona, apontando possíveis melhorias ou bugs:\n\n"
    }
  ];

  // --------------------------------------------------------------------------
  // 1. CARREGAR DEFINIÇÕES & OUVIR MUDANÇAS
  // --------------------------------------------------------------------------
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([
        'adBlockEnabled',
        'exportBtnEnabled',
        'foldersEnabled',
        'promptsEnabled',
        'isPro',
        'exportTrialStartDate',
        'customPrompts',
        'folders'
      ], (items) => {
        if (items.adBlockEnabled !== undefined) state.adBlockEnabled = items.adBlockEnabled;
        if (items.exportBtnEnabled !== undefined) state.exportBtnEnabled = items.exportBtnEnabled;
        if (items.foldersEnabled !== undefined) state.foldersEnabled = items.foldersEnabled;
        if (items.promptsEnabled !== undefined) state.promptsEnabled = items.promptsEnabled;
        if (items.isPro !== undefined) state.isPro = items.isPro;
        if (items.folders) state.folders = items.folders;
        if (items.customPrompts) state.customPrompts = items.customPrompts;

        if (!items.exportTrialStartDate) {
          const now = Date.now();
          state.exportTrialStartDate = now;
          chrome.storage.local.set({ exportTrialStartDate: now });
        } else {
          state.exportTrialStartDate = items.exportTrialStartDate;
        }

        if (state.adBlockEnabled) {
          cleanAds();
        }
        injectTools();
      });
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        for (let key in changes) {
          state[key] = changes[key].newValue;
        }
        if (state.adBlockEnabled) {
          cleanAds();
        }
        injectTools();
      }
    });
  }

  // Ouvir mensagens do Popup (Inserir Prompt no chat)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'insertPrompt') {
        insertPromptIntoInput(request.text);
        showToast('⚡ Prompt inserido no ChatGPT!');
        sendResponse({ success: true });
        return true;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. MOTOR REAL DE REMOÇÃO DE ANÚNCIOS
  // --------------------------------------------------------------------------
  function cleanAds() {
    if (!state.adBlockEnabled) return;

    let removed = 0;
    const directSelectors = [
      '[data-testid*="ad"]',
      '[data-testid*="sponsored"]',
      '[data-testid*="advertisement"]',
      '[data-testid*="partner-result"]',
      '[class*="sponsored-card"]',
      '[class*="sponsored-message"]',
      '[class*="ad-container"]',
      '[class*="ad-unit"]',
      '[aria-label*="sponsored" i]',
      '[aria-label*="patrocinado" i]'
    ];

    try {
      const candidates = document.querySelectorAll(directSelectors.join(','));
      candidates.forEach((el) => {
        if (!el.closest('article') || el.tagName.toLowerCase() !== 'article') {
          el.remove();
          removed++;
        }
      });
    } catch (e) {}

    const containers = document.querySelectorAll('div, section');
    containers.forEach((box) => {
      if (box.children.length > 0 && box.children.length <= 6) {
        const text = (box.innerText || '').trim();
        const isSponsored = /^(patrocinado|sponsored|ad|publicidade)\b/i.test(text) ||
                            (text.length < 80 && /(patrocinado|sponsored)/i.test(text));
        const hasExternalAdLink = box.querySelector('a[href*="bing.com/aclick"], a[href*="ads.openai.com"], a[href*="msn.com"]');

        if ((isSponsored || hasExternalAdLink) && !box.closest('article[data-testid^="conversation-turn-"]') && box.tagName.toLowerCase() !== 'article') {
          box.remove();
          removed++;
        }
      }
    });

    if (removed > 0) {
      incrementBlockedCount(removed);
    }
  }

  function incrementBlockedCount(count) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['blockedCount', 'blockedToday', 'lastDate'], (data) => {
        const today = new Date().toDateString();
        const total = (data.blockedCount || 0) + count;
        const todayCount = (data.lastDate === today ? (data.blockedToday || 0) : 0) + count;
        chrome.storage.local.set({
          blockedCount: total,
          blockedToday: todayCount,
          lastDate: today
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 3. INJEÇÃO DO BOTÃO DE EXPORTAÇÃO & MODAL MULTI-FORMATO
  // --------------------------------------------------------------------------
  function checkTrialActive() {
    if (state.isPro) return true;
    if (!state.exportTrialStartDate) return true;
    const daysPassed = (Date.now() - state.exportTrialStartDate) / (1000 * 60 * 60 * 24);
    return daysPassed <= 30;
  }

  function injectExportButtons() {
    if (!state.exportBtnEnabled) return;

    // 1. Botão individual por resposta
    const actionBars = document.querySelectorAll('div[class*="items-center"][class*="gap-"]');
    actionBars.forEach((bar) => {
      if (bar.querySelector('.chatgpt-clean-export-btn')) return;
      if (bar.querySelector('button[aria-label*="Copy" i], button[aria-label*="Copiar" i], button[data-testid*="copy"]')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chatgpt-clean-export-btn';
        btn.innerHTML = `<span>📥</span><span>Exportar</span>`;
        btn.title = 'Escolher formato para exportar (PDF, Word, Markdown)';

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const turnArticle = btn.closest('article') || btn.closest('[data-testid^="conversation-turn-"]');
          if (turnArticle) {
            const textNode = turnArticle.querySelector('.markdown') || turnArticle;
            const text = (textNode.innerText || '').trim();
            const html = (turnArticle.querySelector('.markdown')?.innerHTML || textNode.innerHTML || '');
            openExportModal(text, html, 'Resposta Individual');
          }
        });

        bar.appendChild(btn);
      }
    });

    // 2. Botão global no topo da conversa (Exportar Chat Completo)
    const headerControls = document.querySelector('header div[class*="flex"][class*="items-center"]') ||
                           document.querySelector('main header') ||
                           document.querySelector('[data-testid="chat-header"]');
    if (headerControls && !document.querySelector('.chatgpt-clean-global-export-btn')) {
      const globalBtn = document.createElement('button');
      globalBtn.type = 'button';
      globalBtn.className = 'chatgpt-clean-global-export-btn';
      globalBtn.innerHTML = `<span>📑</span><span>Exportar Chat Completo</span>`;
      globalBtn.title = 'Exportar todas as perguntas e respostas desta conversa';

      globalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        exportFullConversation();
      });

      headerControls.appendChild(globalBtn);
    }
  }

  function exportFullConversation() {
    const turns = document.querySelectorAll('article, [data-testid^="conversation-turn-"]');
    if (!turns || turns.length === 0) {
      showToast('⚠️ Nenhuma mensagem encontrada para exportar.');
      return;
    }

    let fullMarkdown = `# Conversa ChatGPT - ${new Date().toLocaleDateString()}\n\n`;
    let fullHtml = `<h2>Conversa ChatGPT (${new Date().toLocaleDateString()})</h2><hr/>`;

    turns.forEach((turn, idx) => {
      const isUser = turn.querySelector('[data-message-author-role="user"]') || (idx % 2 === 0);
      const speaker = isUser ? '👤 Tu' : '🤖 ChatGPT';
      const textNode = turn.querySelector('.markdown') || turn;
      const text = (textNode.innerText || '').trim();
      const html = turn.querySelector('.markdown')?.innerHTML || textNode.innerHTML;

      fullMarkdown += `### ${speaker}:\n${text}\n\n---\n\n`;
      fullHtml += `<div style="margin-bottom:18px;"><strong>${speaker}:</strong><div style="margin-top:4px;">${html}</div></div><hr style="border:0;border-top:1px solid #eee;"/>`;
    });

    openExportModal(fullMarkdown, fullHtml, 'Conversa Completa');
  }

  // Abre o Modal com as 3 opções de exportação
  function openExportModal(cleanText, formattedHtml, titleSuffix) {
    if (!checkTrialActive()) {
      showToast('⚠️ O teu trial de 30 dias terminou. Desbloqueia o plano PRO no menu da extensão!');
      return;
    }

    const existing = document.querySelector('.chatgpt-clean-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'chatgpt-clean-modal-overlay';
    overlay.innerHTML = `
      <div class="chatgpt-clean-export-modal">
        <div class="chatgpt-clean-export-modal-header">
          <h3>📥 Exportar ${titleSuffix || 'Conversa'}</h3>
          <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-export">✕</button>
        </div>
        <div class="chatgpt-clean-export-grid">
          <div class="chatgpt-clean-export-card" data-format="pdf">
            <span class="icon">📄</span>
            <div class="info">
              <strong>Documento PDF (.pdf)</strong>
              <span>Layout formatado pronto para guardar ou imprimir</span>
            </div>
          </div>
          <div class="chatgpt-clean-export-card" data-format="word">
            <span class="icon">📝</span>
            <div class="info">
              <strong>Microsoft Word (.doc)</strong>
              <span>Com títulos, tabelas e formatação intactos</span>
            </div>
          </div>
          <div class="chatgpt-clean-export-card" data-format="md">
            <span class="icon">📑</span>
            <div class="info">
              <strong>Ficheiro Markdown (.md)</strong>
              <span>Ideal para Notion, Obsidian e desenvolvedores</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#chatgpt-clean-close-export').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelectorAll('.chatgpt-clean-export-card').forEach(card => {
      card.addEventListener('click', () => {
        const format = card.getAttribute('data-format');
        overlay.remove();
        executeExport(cleanText, formattedHtml, format);
      });
    });
  }

  function executeExport(text, htmlSnippet, format) {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'md') {
      downloadFile(text, `chatgpt-export-${timestamp}.md`, 'text/markdown;charset=utf-8');
      showToast('✅ Ficheiro Markdown (.md) descarregado!');
    } else if (format === 'word') {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Exportação ChatGPT</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
          h1, h2, h3 { color: #1e293b; }
          pre, code { background: #f1f5f9; font-family: Consolas, monospace; font-size: 10pt; padding: 4px; }
          blockquote { border-left: 3px solid #6366f1; margin: 8px 0; padding-left: 10px; color: #475569; }
        </style>
        </head><body>
        <h2>ChatGPT Export • ${timestamp}</h2>
        <hr/>
        <div>${htmlSnippet || escapeHtml(text).replace(/\n/g, '<br/>')}</div>
        </body></html>
      `;
      downloadFile(htmlContent, `chatgpt-export-${timestamp}.doc`, 'application/msword;charset=utf-8');
      showToast('✅ Ficheiro Word (.doc) descarregado!');
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ChatGPT Export - ${timestamp}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: auto; }
              h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; margin-bottom: 20px; }
              pre, code { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
              p { margin-bottom: 12px; }
              @media print { body { padding: 15px; } }
            </style>
          </head>
          <body>
            <h1>ChatGPT Export • ${timestamp}</h1>
            <div>${htmlSnippet || `<pre>${escapeHtml(text)}</pre>`}</div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 200);
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
        showToast('✅ Janela de impressão/PDF aberta!');
      } else {
        showToast('⚠️ Permite popups no browser para imprimir em PDF.');
      }
    }
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------------------------------
  // 4. GESTOR DE PASTAS FUNCIONAL NA BARRA LATERAL (BOOKMARKS DE CONVERSAS)
  // --------------------------------------------------------------------------
  function injectSidebarFolders() {
    if (!state.foldersEnabled) return;
    if (document.querySelector('.chatgpt-clean-folders-container')) return;

    // Seletores para encontrar o topo da barra lateral esquerda do ChatGPT
    const sidebarNav = document.querySelector('nav[aria-label*="hist" i]') ||
                       document.querySelector('nav[aria-label*="chat" i]') ||
                       document.querySelector('nav') ||
                       document.querySelector('#sidebar') ||
                       document.querySelector('div[class*="sidebar"] nav') ||
                       document.querySelector('div[class*="overflow-y-auto"]');
    if (!sidebarNav) return;

    const container = document.createElement('div');
    container.className = 'chatgpt-clean-folders-container';

    let foldersHtml = '';
    state.folders.forEach(f => {
      const chatsList = f.chats || [];
      let chatsHtml = '';
      chatsList.forEach(chat => {
        chatsHtml += `
          <div class="chatgpt-clean-saved-chat" data-url="${escapeHtml(chat.url)}">
            <span class="chat-title" title="${escapeHtml(chat.title)}">💬 ${escapeHtml(chat.title)}</span>
            <button class="btn-delete-saved-chat" data-chat-id="${chat.id}" data-folder-id="${f.id}" title="Remover">✕</button>
          </div>
        `;
      });

      foldersHtml += `
        <div class="chatgpt-clean-folder-wrapper" data-folder-id="${f.id}">
          <div class="chatgpt-clean-folder-item">
            <div class="chatgpt-clean-folder-title">
              <span class="folder-name-toggle">▶ ${escapeHtml(f.name)}</span>
              <div class="folder-actions">
                <button class="btn-save-current-chat" data-folder-id="${f.id}" title="Guardar a conversa aberta nesta pasta">📌 +Chat</button>
                <span class="chatgpt-clean-folder-count">${chatsList.length}</span>
              </div>
            </div>
          </div>
          <div class="chatgpt-clean-folder-chats" style="display: none;">
            ${chatsHtml || '<div class="no-chats-hint">Nenhuma conversa guardada</div>'}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="chatgpt-clean-folders-header">
        <span>📁 Pastas & Favoritos</span>
        <button type="button" class="chatgpt-clean-add-folder-btn" id="chatgpt-clean-btn-new-folder">+ Nova Pasta</button>
      </div>
      <div class="chatgpt-clean-folder-list">
        ${foldersHtml}
      </div>
    `;

    sidebarNav.insertBefore(container, sidebarNav.firstChild);

    // Criar nova pasta
    const addBtn = container.querySelector('#chatgpt-clean-btn-new-folder');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const folderName = prompt('Nome da nova pasta:', '📁 Projetos');
        if (folderName && folderName.trim()) {
          const newFolder = {
            id: 'f_' + Date.now(),
            name: folderName.trim(),
            chats: []
          };
          state.folders.push(newFolder);
          saveFolders();
          container.remove();
          injectSidebarFolders();
          showToast(`📁 Pasta "${newFolder.name}" criada!`);
        }
      });
    }

    // Expandir/colapsar pasta
    container.querySelectorAll('.folder-name-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = toggle.closest('.chatgpt-clean-folder-wrapper');
        const chatsBox = wrapper.querySelector('.chatgpt-clean-folder-chats');
        const isHidden = chatsBox.style.display === 'none';
        chatsBox.style.display = isHidden ? 'block' : 'none';
        toggle.innerText = isHidden ? toggle.innerText.replace('▶', '▼') : toggle.innerText.replace('▼', '▶');
      });
    });

    // Guardar conversa atual na pasta
    container.querySelectorAll('.btn-save-current-chat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        const folder = state.folders.find(f => f.id === folderId);
        if (!folder) return;

        if (!folder.chats) folder.chats = [];
        
        const currentUrl = window.location.href;
        const currentTitle = document.title.replace('- ChatGPT', '').trim() || 'Conversa ChatGPT';

        // Evitar duplicados
        const exists = folder.chats.some(c => c.url === currentUrl);
        if (exists) {
          showToast('ℹ️ Esta conversa já está guardada nesta pasta.');
          return;
        }

        folder.chats.push({
          id: 'c_' + Date.now(),
          title: currentTitle.slice(0, 32),
          url: currentUrl,
          date: new Date().toLocaleDateString()
        });

        saveFolders();
        container.remove();
        injectSidebarFolders();
        showToast(`📌 Conversa guardada em "${folder.name}"!`);
      });
    });

    // Abrir conversa guardada ao clicar
    container.querySelectorAll('.chatgpt-clean-saved-chat').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-saved-chat')) return;
        const url = item.getAttribute('data-url');
        if (url) window.location.href = url;
      });
    });

    // Remover conversa guardada
    container.querySelectorAll('.btn-delete-saved-chat').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = delBtn.getAttribute('data-folder-id');
        const chatId = delBtn.getAttribute('data-chat-id');
        const folder = state.folders.find(f => f.id === folderId);
        if (folder && folder.chats) {
          folder.chats = folder.chats.filter(c => c.id !== chatId);
          saveFolders();
          container.remove();
          injectSidebarFolders();
          showToast('🗑️ Conversa removida da pasta.');
        }
      });
    });
  }

  function saveFolders() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ folders: state.folders });
    }
  }

  // --------------------------------------------------------------------------
  // 5. INJEÇÃO DE PROMPTS RÁPIDOS (BOTÃO ⚡ JUNTO AO INPUT)
  // --------------------------------------------------------------------------
  function injectPromptTrigger() {
    if (!state.promptsEnabled) return;
    if (document.querySelector('.chatgpt-clean-prompt-trigger')) return;

    const promptContainer = document.querySelector('form div[class*="flex"][class*="items-end"]') ||
                            document.querySelector('#prompt-textarea')?.parentElement ||
                            document.querySelector('form');

    if (promptContainer && !promptContainer.querySelector('.chatgpt-clean-prompt-trigger')) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'chatgpt-clean-prompt-trigger';
      trigger.innerHTML = `⚡`;
      trigger.title = 'ChatGPT Clean: Inserir Prompt Rápido';
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePromptsModal();
      });

      promptContainer.insertBefore(trigger, promptContainer.firstChild);
    }
  }

  function togglePromptsModal() {
    const existing = document.querySelector('.chatgpt-clean-prompts-modal');
    if (existing) {
      existing.remove();
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'chatgpt-clean-prompts-modal';

    const promptsList = (state.customPrompts && state.customPrompts.length > 0)
      ? state.customPrompts
      : DEFAULT_PROMPTS;

    let itemsHtml = '';
    promptsList.forEach((p, idx) => {
      itemsHtml += `
        <div class="chatgpt-clean-prompt-item" data-index="${idx}">
          <div class="chatgpt-clean-prompt-title">${escapeHtml(p.title)}</div>
          <div class="chatgpt-clean-prompt-text">${escapeHtml(p.text)}</div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="chatgpt-clean-prompts-header">
        <span>⚡ Escolhe um Prompt para preencher o chat</span>
        <button class="chatgpt-clean-prompts-close" id="chatgpt-clean-close-modal">✕</button>
      </div>
      <div class="chatgpt-clean-prompts-list">
        ${itemsHtml}
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('chatgpt-clean-close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelectorAll('.chatgpt-clean-prompt-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        const selected = promptsList[idx];
        if (selected) {
          insertPromptIntoInput(selected.text);
          modal.remove();
          showToast('⚡ Prompt inserido no chat!');
        }
      });
    });
  }

  // Inserção Robusta: Funciona em <textarea> e div[contenteditable="true"] (ProseMirror do ChatGPT)
  function insertPromptIntoInput(text) {
    const inputElement = document.querySelector('#prompt-textarea') ||
                         document.querySelector('div[contenteditable="true"]') ||
                         document.querySelector('textarea');

    if (!inputElement) {
      navigator.clipboard.writeText(text);
      showToast('📋 Copiado! (Cola no chat com Ctrl+V)');
      return;
    }

    inputElement.focus();

    if (inputElement.isContentEditable || inputElement.getAttribute('contenteditable') === 'true') {
      // Método 1: Usar execCommand para simular digitação nativa no ProseMirror
      const success = document.execCommand('insertText', false, text);
      if (!success) {
        // Fallback para injeção em nós de parágrafo internos
        let p = inputElement.querySelector('p');
        if (!p) {
          p = document.createElement('p');
          inputElement.appendChild(p);
        }
        p.innerText = text;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function showToast(msg) {
    const existing = document.querySelector('.chatgpt-clean-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'chatgpt-clean-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function injectTools() {
    injectExportButtons();
    injectPromptTrigger();
    injectSidebarFolders();
  }

  // --------------------------------------------------------------------------
  // 6. OBSERVER DINÂMICO
  // --------------------------------------------------------------------------
  let scanScheduled = false;
  const observer = new MutationObserver(() => {
    if (!scanScheduled) {
      scanScheduled = true;
      requestAnimationFrame(() => {
        if (state.adBlockEnabled) {
          cleanAds();
        }
        injectTools();
        scanScheduled = false;
      });
    }
  });

  function init() {
    loadSettings();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      if (state.adBlockEnabled) cleanAds();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        if (state.adBlockEnabled) cleanAds();
      });
    }
  }

  init();
})();
