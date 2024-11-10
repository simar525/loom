interface ConfluenceCredentials {
  baseUrl: string;
  username: string;
  apiToken: string;
  spaceId: string;
}

const CONFLUENCE_CONFIG: ConfluenceCredentials = {
  baseUrl: import.meta.env.VITE_CONFLUENCE_BASE_URL,
  username: import.meta.env.VITE_CONFLUENCE_USERNAME,
  apiToken: import.meta.env.VITE_CONFLUENCE_API_TOKEN,
  spaceId: import.meta.env.VITE_CONFLUENCE_SPACE_ID
};

export async function uploadToConfluence(videoBlob: Blob): Promise<string> {
  try {
    if (!CONFLUENCE_CONFIG.baseUrl || !CONFLUENCE_CONFIG.username || 
        !CONFLUENCE_CONFIG.apiToken || !CONFLUENCE_CONFIG.spaceId) {
      throw new Error('Confluence configuration is incomplete. Please check your environment variables.');
    }

    // Create a page to host the attachment
    const createPageBody = {
      spaceId: CONFLUENCE_CONFIG.spaceId,
      status: "current",
      title: `Screen Recording - ${new Date().toLocaleString()}`,
      body: {
        representation: "storage",
        value: "<p>This page contains a screen recording.</p>"
      }
    };

    const pageResponse = await fetch(`${CONFLUENCE_CONFIG.baseUrl}/wiki/api/v2/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${CONFLUENCE_CONFIG.username}:${CONFLUENCE_CONFIG.apiToken}`)}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(createPageBody)
    });

    if (!pageResponse.ok) {
      const errorData = await pageResponse.text();
      throw new Error(`Failed to create page: ${errorData}`);
    }

    const page = await pageResponse.json();
    const pageId = page.id;

    // Upload the attachment
    const formData = new FormData();
    const fileName = `recording-${Date.now()}.webm`;
    formData.append('file', videoBlob, fileName);

    const attachmentResponse = await fetch(
      `${CONFLUENCE_CONFIG.baseUrl}/wiki/api/v2/pages/${pageId}/attachments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${CONFLUENCE_CONFIG.username}:${CONFLUENCE_CONFIG.apiToken}`)}`,
          'X-Atlassian-Token': 'no-check'
        },
        body: formData
      }
    );

    if (!attachmentResponse.ok) {
      const errorData = await attachmentResponse.text();
      throw new Error(`Failed to upload attachment: ${errorData}`);
    }

    const attachmentData = await attachmentResponse.json();
    
    // Update the page content to include the video player
    const updatePageBody = {
      id: pageId,
      status: "current",
      title: page.title,
      body: {
        representation: "storage",
        value: `
          <p>Screen recording created on ${new Date().toLocaleString()}</p>
          <p>
            <ac:structured-macro ac:name="attachments">
              <ac:parameter ac:name="upload">false</ac:parameter>
              <ac:parameter ac:name="preview">true</ac:parameter>
            </ac:structured-macro>
          </p>
        `
      },
      version: {
        number: page.version.number + 1,
        message: "Added video attachment"
      }
    };

    await fetch(`${CONFLUENCE_CONFIG.baseUrl}/wiki/api/v2/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa(`${CONFLUENCE_CONFIG.username}:${CONFLUENCE_CONFIG.apiToken}`)}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updatePageBody)
    });

    // Return the direct download URL for the attachment
    return `${CONFLUENCE_CONFIG.baseUrl}/wiki/download/attachments/${pageId}/${fileName}`;
  } catch (error) {
    console.error('Confluence upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload to Confluence');
  }
}