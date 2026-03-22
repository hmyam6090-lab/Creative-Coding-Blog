const projectList = document.getElementById('project-list');

function createVideoCover(project) {
  const videoMedia = (project.media || []).find((item) => item.type === 'video');
  if (!videoMedia) return null;

  const video = document.createElement('video');
  video.className = 'project-cover';
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.controls = false;

  const source = document.createElement('source');
  source.src = videoMedia.src;
  source.type = videoMedia.mimeType || 'video/mp4';
  video.appendChild(source);
  video.append('Your browser does not support the video tag.');

  video.addEventListener('loadeddata', () => {
    void video.play().catch(() => {});
  });

  return video;
}

function createVideoModal() {
  const overlay = document.createElement('div');
  overlay.className = 'video-modal';
  overlay.hidden = true;

  const dialog = document.createElement('div');
  dialog.className = 'video-modal-dialog';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'video-modal-close';
  closeButton.setAttribute('aria-label', 'Close video');
  closeButton.textContent = '×';

  const player = document.createElement('video');
  player.className = 'video-modal-player';
  player.controls = true;
  player.playsInline = true;
  player.preload = 'metadata';

  const source = document.createElement('source');
  player.appendChild(source);

  dialog.append(closeButton, player);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  function closeModal() {
    overlay.hidden = true;
    document.body.classList.remove('modal-open');
    player.pause();
    source.removeAttribute('src');
    player.load();
  }

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) {
      closeModal();
    }
  });

  return {
    open(videoMedia) {
      source.src = videoMedia.src;
      source.type = videoMedia.mimeType || 'video/mp4';
      overlay.hidden = false;
      document.body.classList.add('modal-open');
      player.currentTime = 0;
      player.loop = false;
      player.muted = false;
      player.volume = 1;
      player.load();
      void player.play();
    }
  };
}

function createProjectCard(project) {
  const card = document.createElement('li');
  card.className = 'project-card';

  const preview = document.createElement('div');
  preview.className = 'project-preview';

  const title = document.createElement('h3');
  title.className = 'project-title';
  title.textContent = project.title;

  const titleOverlay = document.createElement('div');
  titleOverlay.className = 'title-overlay';
  titleOverlay.appendChild(title);

  const videoMedia = (project.media || []).find((item) => item.type === 'video');
  const cover = createVideoCover(project);
  if (cover) {
    preview.appendChild(cover);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'project-cover project-cover-placeholder';
    placeholder.textContent = 'NO VIDEO';
    preview.appendChild(placeholder);
  }
  preview.appendChild(titleOverlay);

  if (videoMedia) {
    preview.addEventListener('click', () => {
      modalPlayer.open(videoMedia);
    });
  }

  const details = document.createElement('div');
  details.className = 'project-details';

  const tags = document.createElement('div');
  tags.className = 'tags';
  (project.tags || []).forEach((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    tags.appendChild(span);
  });

  const sourceButton = document.createElement('a');
  sourceButton.className = 'source-button';
  sourceButton.href = project.sourceUrl || 'https://github.com/';
  sourceButton.target = '_blank';
  sourceButton.rel = 'noreferrer';
  sourceButton.textContent = 'More Info';

  details.append(tags, sourceButton);
  card.append(preview, details);
  return card;
}

function showEmptyState(message) {
  if (!projectList) return;

  const state = document.createElement('li');
  state.className = 'project-card empty-state';
  state.textContent = message;

  projectList.innerHTML = '';
  projectList.appendChild(state);
}

async function loadProjects() {
  if (!projectList) return;

  try {
    const response = await fetch('data/projects.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load project data: ${response.status}`);
    }

    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      showEmptyState('No projects yet. Add entries to data/projects.json.');
      return;
    }

    projectList.innerHTML = '';
    projects.forEach((project) => {
      projectList.appendChild(createProjectCard(project));
    });
  } catch (error) {
    console.error(error);
    showEmptyState('Could not load projects. Check data/projects.json path and format.');
  }
}

const modalPlayer = createVideoModal();

loadProjects();
