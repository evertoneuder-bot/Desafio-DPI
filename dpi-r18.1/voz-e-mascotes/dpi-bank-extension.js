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

  function merge(base, additions) {
    const bank = Array.isArray(base) ? base.slice() : [];
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

  root.DPIBankExtension = Object.freeze({ validate, merge });
})(window);
