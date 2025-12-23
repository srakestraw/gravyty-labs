/**
 * Program Match Widget Loader
 * 
 * Embeds the Program Match experience on external websites
 */

(function() {
  'use strict';

  // Wait for configuration
  if (!window.GravytyProgramMatch) {
    console.error('GravytyProgramMatch configuration not found');
    return;
  }

  const config = window.GravytyProgramMatch;
  const containerId = config.containerId || 'gravyty-program-match';
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container element #${containerId} not found`);
    return;
  }

  // Build embed URL
  const baseUrl = config.dataProviderBaseUrl || window.location.origin;
  const params = new URLSearchParams({
    institutionId: config.institutionId,
    quizId: config.quizId,
    ...(config.quizVersion && { quizVersion: config.quizVersion }),
  });

  // Add tracking params if enabled
  if (config.tracking?.utm) {
    const urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      if (urlParams.has(param)) {
        params.append(param, urlParams.get(param));
      }
    });
  }

  if (config.tracking?.referrer && document.referrer) {
    params.append('referrer', document.referrer);
  }

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/program-match/embed?${params.toString()}`;
  iframe.width = '100%';
  iframe.height = '900';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.title = 'Find Your Program';
  iframe.setAttribute('loading', 'lazy');

  // Handle responsive height
  if (config.responsive !== false) {
    // Listen for height messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'gravyty-program-match-height') {
        iframe.height = event.data.height + 'px';
      }
    });
  }

  // Append to container
  container.appendChild(iframe);

  // Optional: Add loading state
  if (config.showLoading !== false) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'gravyty-program-match-loading';
    loadingDiv.style.cssText = 'text-align: center; padding: 2rem; color: #666;';
    loadingDiv.textContent = 'Loading...';
    container.insertBefore(loadingDiv, iframe);

    iframe.onload = () => {
      const loading = document.getElementById('gravyty-program-match-loading');
      if (loading) loading.remove();
    };
  }
})();





