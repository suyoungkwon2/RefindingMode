import { sessions } from './sessions';
import type { SearchResult, ScopeRange, ScopeTime, ScopeForm, Session } from '../types';

interface ScriptedPattern {
  keywords: string[];
  results: Array<{ sessionId: string; anchorId: string; tags: string[] }>;
}

const SCRIPTED_PATTERNS: ScriptedPattern[] = [
  // ── A2: first search (scope 미지정, T-designtable이 2위) ──────────────────
  {
    keywords: ['연구 조건, 변인', '측정 지표 등을 정리한', '정확한 단어는 기억이 안'],
    results: [
      { sessionId: 's1', anchorId: 'T-paptable',     tags: ['#표', '#연구흐름', '#비교표'] },
      { sessionId: 's3', anchorId: 'T-designtable',  tags: ['#연구설계', '#집중도', '#변인표'] },
      { sessionId: 's6', anchorId: 'T-validity',     tags: ['#연구설계', '#타당도', '#UT'] },
      { sessionId: 's5', anchorId: 'T-abstract',     tags: ['#표', '#초안', '#수면연구'] },
    ],
  },
  // ── A2: second search (scope 수정 후, T-designtable이 1위) ────────────────
  {
    keywords: ['참조범위를 수정했습니다', '참조 범위를 수정', '수정했습니다. 다시 찾아'],
    results: [
      { sessionId: 's3', anchorId: 'T-designtable',  tags: ['#연구설계', '#실험조건', '#변인표'] },
      { sessionId: 's3', anchorId: 'A1-fakeeffect1', tags: ['#집중도', '#EffectSize', '#알림타이밍'] },
      { sessionId: 's1', anchorId: 'T-paptable',     tags: ['#표', '#연구흐름', '#문헌리뷰'] },
      { sessionId: 's6', anchorId: 'T-concept',      tags: ['#연구방법', '#개념정리'] },
    ],
  },

  {
    keywords: ['effect size를 어떻게', '생성형 ai 피드백을 받은 그룹', '수정에 대한 대화', '글쓰기 수정에 대한'],
    results: [
      { sessionId: 's2', anchorId: 'T-effect', tags: ['#p값vs효과크기', '#CohenD기준표', '#소규모표본주의'] },
      { sessionId: 's3', anchorId: 'A1-fakeeffect1', tags: ['#집중도저하측정', '#실험통계분석', '#CohenD적용'] },
      { sessionId: 's5', anchorId: 'A1-fakeeffect2', tags: ['#수면앱효과측정', '#임상적유의미성', '#효과크기해석'] },
    ],
  },
  {
    keywords: ['효과크기', 'effect size', 'cohen', '효과 크기', 'cohens d'],
    results: [
      { sessionId: 's2', anchorId: 'T-effect', tags: ['#효과크기', '#통계해석', '#CohenD'] },
      { sessionId: 's3', anchorId: 'T-designtable', tags: ['#연구설계', '#변인'] },
    ],
  },
  {
    keywords: ['집중도', '알림', '조건', '변인', '연구 설계 표', '연구설계표', '실험조건'],
    results: [
      { sessionId: 's3', anchorId: 'T-designtable', tags: ['#연구설계', '#집중도', '#변인표'] },
      { sessionId: 's1', anchorId: 'T-paptable', tags: ['#표', '#연구흐름'] },
    ],
  },
  {
    keywords: ['타당도', 'validity', '내적 타당도', '외적 타당도', 'UT 관련', 'UT관련'],
    results: [
      { sessionId: 's6', anchorId: 'T-validity', tags: ['#타당도', '#사용자연구', '#내적타당도'] },
      { sessionId: 'd2', anchorId: 'D2-validity', tags: ['#타당도', '#사용성테스트', '#관찰연구'] },
    ],
  },
  {
    keywords: ['수면', 'abstract', '초안', '스마트워치', '수면 연구'],
    results: [
      { sessionId: 's5', anchorId: 'T-abstract', tags: ['#Abstract', '#수면연구', '#논문초안'] },
      { sessionId: 's5', anchorId: 'T-relwork', tags: ['#선행연구', '#수면', '#웨어러블'] },
    ],
  },
  {
    keywords: ['발표', '목차', '슬라이드', '슬라이드 구성', '발표 자료'],
    results: [
      { sessionId: 's4', anchorId: 'T-outline', tags: ['#발표목차', '#슬라이드구성', '#프레젠테이션'] },
      { sessionId: 's1', anchorId: 'T-paptable', tags: ['#표', '#논문리뷰'] },
    ],
  },
  {
    keywords: ['논문 비교', '논문비교', '논문 비교 표', '비교 표', '비교표', '문헌비교'],
    results: [
      { sessionId: 's1', anchorId: 'T-paptable', tags: ['#논문비교표', '#문헌리뷰', '#연구흐름'] },
      { sessionId: 'd1', anchorId: 'D1-table', tags: ['#논문비교표', '#학습플랫폼', '#MOOC'] },
    ],
  },
  {
    keywords: ['신뢰도', 'reliability', '평가자 간', 'irr', 'kappa', 'cronbach'],
    results: [
      { sessionId: 's6', anchorId: 'T-reliability', tags: ['#신뢰도', '#CronbachAlpha', '#측정일관성'] },
      { sessionId: 'd2', anchorId: 'D2-reliability', tags: ['#신뢰도', '#사용성테스트', '#IRR'] },
    ],
  },
  {
    keywords: ['표집', 'sampling', '편의표집', '목적표집', '표본'],
    results: [
      { sessionId: 's6', anchorId: 'T-sampling', tags: ['#표집', '#표본설계', '#편의표집'] },
      { sessionId: 's6', anchorId: 'T-concept', tags: ['#방법론', '#보고서작성'] },
    ],
  },
  {
    keywords: ['한계점', 'limitation', '연구 한계'],
    results: [
      { sessionId: 's1', anchorId: 'T-limit', tags: ['#한계점', '#Limitation', '#편의표집'] },
      { sessionId: 's2', anchorId: 'T-effect', tags: ['#소규모표본', '#통계한계'] },
    ],
  },
  {
    keywords: ['related work', '선행연구', '관련 연구', '문헌 검토'],
    results: [
      { sessionId: 's5', anchorId: 'T-relwork', tags: ['#RelatedWork', '#선행연구', '#문헌리뷰'] },
      { sessionId: 's1', anchorId: 'T-paptable', tags: ['#문헌리뷰', '#연구흐름'] },
    ],
  },
];

function matchKeywords(query: string, keywords: string[]): boolean {
  const q = query.toLowerCase();
  return keywords.some((kw) => q.includes(kw.toLowerCase()));
}

function filterByScope(
  allSessions: Session[],
  scope: ScopeRange,
  activeSessionId: string | null,
  scopeTime: ScopeTime,
  scopeForm: ScopeForm
): Set<string> {
  const today = new Date('2026-05-23');

  let eligible = allSessions;

  if (scope === 'current' && activeSessionId) {
    eligible = allSessions.filter((s) => s.id === activeSessionId);
  } else if (scope === 'related' && activeSessionId) {
    const active = allSessions.find((s) => s.id === activeSessionId);
    if (active) {
      const researchTypes = ['target', 'distractor'];
      eligible = researchTypes.includes(active.type)
        ? allSessions.filter((s) => researchTypes.includes(s.type))
        : allSessions.filter((s) => s.type === 'dummy');
    }
  }

  if (scopeTime === 'recent7') {
    eligible = eligible.filter((s) => {
      const diff = Math.floor((today.getTime() - new Date(s.date).getTime()) / 86400000);
      return diff <= 7;
    });
  } else if (scopeTime === 'recent30') {
    eligible = eligible.filter((s) => {
      const diff = Math.floor((today.getTime() - new Date(s.date).getTime()) / 86400000);
      return diff <= 30;
    });
  }

  if (scopeForm === 'table') {
    eligible = eligible.filter((s) =>
      s.anchors.some((a) => a.tags.some((t) => t.includes('표') || t.includes('비교') || t.includes('정리')))
    );
  } else if (scopeForm === 'research') {
    eligible = eligible.filter((s) => s.type === 'target' || s.type === 'distractor');
  } else if (scopeForm === 'concept') {
    eligible = eligible.filter((s) => s.anchors.some((a) => a.tags.some((t) => t.includes('개념') || t.includes('정의') || t.includes('설명'))));
  }

  return new Set(eligible.map((s) => s.id));
}

export function search(
  query: string,
  scopeRange: ScopeRange,
  scopeTime: ScopeTime,
  scopeForm: ScopeForm,
  activeSessionId: string | null
): SearchResult[] {
  if (!query.trim()) return [];

  const eligibleIds = filterByScope(sessions, scopeRange, activeSessionId, scopeTime, scopeForm);

  // try scripted patterns first
  for (const pattern of SCRIPTED_PATTERNS) {
    if (matchKeywords(query, pattern.keywords)) {
      const results: SearchResult[] = [];
      pattern.results.forEach((r, i) => {
        if (!eligibleIds.has(r.sessionId)) return;
        const session = sessions.find((s) => s.id === r.sessionId);
        const anchor = session?.anchors.find((a) => a.id === r.anchorId);
        if (session && anchor) {
          results.push({ session, anchor, matchReasonTags: r.tags, rank: i + 1 });
        }
      });
      if (results.length > 0) return results;
    }
  }

  // fallback: generic keyword match across all anchors
  const q = query.toLowerCase();
  const fallback: SearchResult[] = [];

  for (const session of sessions) {
    if (!eligibleIds.has(session.id)) continue;
    for (const anchor of session.anchors) {
      const score =
        (anchor.label.toLowerCase().includes(q) ? 3 : 0) +
        (anchor.preview.toLowerCase().includes(q) ? 2 : 0) +
        (anchor.tags.some((t) => t.toLowerCase().includes(q)) ? 2 : 0) +
        (session.title.toLowerCase().includes(q) ? 1 : 0);

      if (score > 0) {
        fallback.push({
          session,
          anchor,
          matchReasonTags: anchor.tags.slice(0, 3),
          rank: fallback.length + 1,
        });
      }
    }
  }

  return fallback.slice(0, 3);
}
