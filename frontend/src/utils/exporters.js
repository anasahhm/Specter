export async function exportAsJSON(data, filename = 'report.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString));
  element.setAttribute('download', filename);
  element.click();
}
 
export async function exportAsCSV(data, filename = 'report.csv') {
  let csv = [];
  
  // Add headers
  if (Array.isArray(data) && data.length > 0) {
    csv.push(Object.keys(data[0]).join(','));
    
    // Add rows
    data.forEach(row => {
      csv.push(Object.values(row).map(v => 
        typeof v === 'string' ? `"${v}"` : v
      ).join(','));
    });
  }
  
  const csvContent = csv.join('\n');
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
  element.setAttribute('download', filename);
  element.click();
}
 
export function shareReport(reportId) {
  const shareUrl = `${window.location.origin}/report/${reportId}`;
  navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}