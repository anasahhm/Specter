export function generateReportContent(investigation) {
  return {
    title: `Threat Intelligence Report: ${investigation.targetValue}`,
    summary: investigation.aiSummary,
    riskScore: investigation.riskScore,
    threatLevel: investigation.threatLevel,
    findings: investigation.suspiciousPatterns,
    recommendations: investigation.recommendations,
    linkedEntities: investigation.linkedIdentities,
    generatedAt: new Date().toISOString()
  };
}

export function downloadReportAsJSON(reportData) {
  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `specter-report-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadReportAsText(reportData) {
  const text = `
SPECTER THREAT INTELLIGENCE REPORT
===================================

Target: ${reportData.title}
Risk Score: ${reportData.riskScore}/100
Threat Level: ${reportData.threatLevel}

SUMMARY
${reportData.summary}

KEY FINDINGS
${reportData.findings.map(f => `• ${f}`).join('\n')}

RECOMMENDATIONS
${reportData.recommendations.map(r => `✓ ${r}`).join('\n')}

LINKED ENTITIES
${reportData.linkedEntities.map(e => `• ${e.username} (${e.platform})`).join('\n')}

Generated: ${reportData.generatedAt}
  `;
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `specter-report-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}