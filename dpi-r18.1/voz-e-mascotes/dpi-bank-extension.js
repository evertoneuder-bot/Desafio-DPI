(function (root) {
  'use strict';

  const letter = value => String(value || '').trim().toUpperCase();
  const validUrl = value => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  };

  function validate(question) {
    if (!question || typeof question !== 'object' || Array.isArray(question)) return false;
    const requiredText = [
      'id', 'tema', 'subtema', 'dificuldade', 'tipo', 'pergunta', 'alternativa_a', 'alternativa_b',
      'alternativa_c', 'alternativa_d', 'resposta_correta_extenso',
      'explicacao', 'dica', 'fonte', 'referencia', 'url_fonte'
    ];
    if (requiredText.some(key => typeof question[key] !== 'string' || !question[key].trim())) return false;
    if (!['fácil', 'intermediária', 'difícil'].includes(String(question.dificuldade).trim().toLocaleLowerCase('pt-BR'))) return false;
    if (question.tipo !== 'multipla_escolha') return false;
    if (!Array.isArray(question.respostas_aceitas_voz) || question.respostas_aceitas_voz.some(value => typeof value !== 'string')) return false;
    if (!Number.isFinite(Number(question.pontuacao)) || Number(question.pontuacao) < 0 || typeof question.ativo !== 'boolean') return false;
    if (!['A', 'B', 'C', 'D'].includes(letter(question.letra_correta))) return false;
    if (!validUrl(question.url_fonte)) return false;
    return true;
  }

  function correctSerialFollowupText(question) {
    if (!question || typeof question !== 'object') return question;
    const fields = [
      'pergunta', 'alternativa_a', 'alternativa_b', 'alternativa_c', 'alternativa_d',
      'resposta_correta_extenso', 'explicacao', 'dica', 'limitacao_clinica'
    ];
    let corrected = question;
    for (const field of fields) {
      const value = corrected[field];
      if (typeof value !== 'string') continue;
      const replacement = value.replaceAll('repetida seriamente', 'repetida em série').replaceAll('avaliada seriamente', 'avaliada em exames seriados');
      if (replacement !== value) {
        if (corrected === question) corrected = { ...question };
        corrected[field] = replacement;
      }
    }
    return corrected;
  }

  function merge(base, additions) {
    const bank = Array.isArray(base) ? base.map(correctSerialFollowupText) : [];
    const ids = new Set(bank.map(question => String(question?.id || '')));
    const result = { bank, accepted: 0, rejected: 0, duplicates: 0 };
    if (!Array.isArray(additions)) {
      result.rejected = additions == null ? 0 : 1;
      return result;
    }
    for (const question of additions) {
      if (!validate(question)) {
        result.rejected++;
        continue;
      }
      const id = String(question.id).trim();
      if (ids.has(id)) {
        result.duplicates++;
        continue;
      }
      ids.add(id);
      result.bank.push({ ...question, id, letra_correta: letter(question.letra_correta) });
      result.accepted++;
    }
    return result;
  }

  // Corrige no acervo o link antigo do livro de Thrall, mantendo a abertura em nova aba.
  function repairLibraryLink() {
    if (new URLSearchParams(root.location.search).get('mode') !== 'bank') return false;
    const oldId = '1Q1gtoiPRJ3TvK4r9X3WKMijSKoXEsXdR';
    const validId = '1djs62fxBu-qG-r5c7M55ZTYGuf0fhmx6';
    let changed = false;
    for (const anchor of root.document.querySelectorAll('a[href]')) {
      if (!anchor.href.includes(oldId)) continue;
      anchor.href = anchor.href.replace(oldId, validId);
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      changed = true;
    }
    return changed;
  }

  if (root.document?.documentElement) {
    repairLibraryLink();
    const observer = new MutationObserver(() => {
      if (repairLibraryLink()) observer.disconnect();
    });
    observer.observe(root.document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
    root.addEventListener('DOMContentLoaded', () => {
      if (repairLibraryLink()) observer.disconnect();
    }, { once: true });
  }

  root.DPIBankExtension = Object.freeze({ validate, merge });
})(window);
