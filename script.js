const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });
}

const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((element) => revealObserver.observe(element));

/* ============================
   SKILLS ORBIT
   ============================ */

const skills = [
  { name: 'Numpy', level: 'Expert' },
  { name: 'Pandas', level: 'Expert' },
  { name: 'Matplotlib', level: 'Expert' },
  { name: 'Seaborn', level: 'Expert' },
  { name: 'Scikit-learn', level: 'Expert' },
  { name: 'Flask', level: 'Expert' },
  { name: 'SQL', level: 'Expert' },
  { name: 'MongoDB', level: 'Expert' },
  { name: 'PostgreSQL', level: 'Expert' },
  { name: 'Git', level: 'Expert' },
  { name: 'OpenCV', level: 'Expert' },
  { name: 'TensorFlow', level: 'Expert' },
  { name: 'Keras', level: 'Expert' },
  { name: 'PyTorch', level: 'Expert' },
  { name: 'Hugging Face', level: 'Expert' },
];

const skillNodes = document.getElementById('skillNodes');
const skillsGrid = document.getElementById('skillsGrid');
const tooltip = document.getElementById('skillTooltip');

function renderSkillsOrbit() {
  if (!skillNodes) return;

  const centerX = 50;
  const centerY = 50;

  skills.forEach((skill, index) => {
    const angle = (index / skills.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * 38;
    const y = centerY + Math.sin(angle) * 30;

    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'skill-node';
    node.textContent = skill.name;
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    node.style.transform = `translate(-50%, -50%)`;

    node.addEventListener('mouseenter', () => {
      if (tooltip) {
        tooltip.textContent = `${skill.name} · ${skill.level}`;
        tooltip.classList.add('visible');
      }
    });

    node.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('visible');
    });

    node.addEventListener('focus', () => {
      if (tooltip) {
        tooltip.textContent = `${skill.name} · ${skill.level}`;
        tooltip.classList.add('visible');
      }
    });

    node.addEventListener('blur', () => {
      if (tooltip) tooltip.classList.remove('visible');
    });

    skillNodes.appendChild(node);
  });
}

function renderSkillsGrid() {
  if (!skillsGrid) return;

  skills.forEach((skill) => {
    const tile = document.createElement('div');
    tile.className = 'skill-tile';
    tile.innerHTML = `<strong>${skill.name}</strong><span>${skill.level}</span>`;
    skillsGrid.appendChild(tile);
  });
}

renderSkillsOrbit();
renderSkillsGrid();

window.addEventListener('resize', () => {
  const skillNodesContainer = document.getElementById('skillNodes');
  if (!skillNodesContainer) return;

  skillNodesContainer.innerHTML = '';
  renderSkillsOrbit();
});

/* ============================
   CONTACT FORM
   ============================ */

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    setTimeout(() => {
      formStatus.textContent = 'Message sent! I will get back to you soon.';
      contactForm.reset();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
    }, 700);
  });
}

/* ============================
   3D BACKGROUND — PARTICLE FIELD
   ============================ */

function initBackgroundScene() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = window.innerWidth < 760 ? 700 : 1800;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff0033,
    size: 0.14,
    transparent: true,
    opacity: 0.65,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0002;

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}

/* ============================
   3D AVATAR — HUMANOID FIGURE
   ============================ */

function initAvatarScene() {
  const canvas = document.getElementById('avatarCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
 
  const parent = canvas.parentElement;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
 
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);
 
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 
  const orbGroup = new THREE.Group();
  scene.add(orbGroup);
 
  /* ---- Generate node points evenly across a sphere (fibonacci sphere) ---- */
  const nodeCount = 90;
  const radius = 1.7;
  const nodePositions = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
 
  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
 
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
 
    nodePositions.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
 
  /* ---- Node points (glowing dots) ---- */
  const nodeGeometry = new THREE.BufferGeometry();
  const nodeArray = new Float32Array(nodeCount * 3);
  nodePositions.forEach((point, index) => {
    nodeArray[index * 3] = point.x;
    nodeArray[index * 3 + 1] = point.y;
    nodeArray[index * 3 + 2] = point.z;
  });
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodeArray, 3));
 
  const nodeMaterial = new THREE.PointsMaterial({
    color: 0xff0033,
    size: 0.09,
    transparent: true,
    opacity: 0.95,
  });
 
  const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
  orbGroup.add(nodePoints);
 
  /* ---- Connections between nearby nodes (neural network lines) ---- */
  const linePositions = [];
  const maxConnectionDistance = 0.75;
 
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const distance = nodePositions[i].distanceTo(nodePositions[j]);
      if (distance < maxConnectionDistance) {
        linePositions.push(
          nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
          nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
        );
      }
    }
  }
 
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
 
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0033,
    transparent: true,
    opacity: 0.15,
  });
 
  const connections = new THREE.LineSegments(lineGeometry, lineMaterial);
  orbGroup.add(connections);
 
  /* ---- Pulsing core at the center ---- */
  const coreGeometry = new THREE.SphereGeometry(0.32, 24, 24);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0033,
    transparent: true,
    opacity: 0.5,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  orbGroup.add(core);
 
  /* ---- Thin outer wireframe shell for structure ---- */
  const shellGeometry = new THREE.IcosahedronGeometry(radius, 1);
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0033,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  orbGroup.add(shell);
 
  /* ---- Orbiting "data packet" particles ---- */
  const dataParticles = [];
  const dataCount = 10;
 
  for (let i = 0; i < dataCount; i++) {
    const particleGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xff0033, transparent: true, opacity: 0.9 });
    const particle = new THREE.Mesh(particleGeo, particleMat);
 
    particle.userData = {
      radius: radius + 0.5 + Math.random() * 0.6,
      speed: 0.3 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      tilt: Math.random() * Math.PI,
    };
 
    dataParticles.push(particle);
    scene.add(particle);
  }
 
  /* ---- Two faint orbit rings for extra sci-fi framing ---- */
  const ringOneGeo = new THREE.TorusGeometry(2.5, 0.006, 8, 100);
  const ringOneMat = new THREE.MeshBasicMaterial({ color: 0xff0033, transparent: true, opacity: 0.25 });
  const ringOne = new THREE.Mesh(ringOneGeo, ringOneMat);
  ringOne.rotation.x = Math.PI / 2.4;
  scene.add(ringOne);
 
  const ringTwoGeo = new THREE.TorusGeometry(2.8, 0.005, 8, 100);
  const ringTwoMat = new THREE.MeshBasicMaterial({ color: 0xff0033, transparent: true, opacity: 0.15 });
  const ringTwo = new THREE.Mesh(ringTwoGeo, ringTwoMat);
  ringTwo.rotation.x = Math.PI / 1.7;
  ringTwo.rotation.y = Math.PI / 5;
  scene.add(ringTwo);
 
  /* ---- Drag to rotate ---- */
  let targetRotY = 0;
  let targetRotX = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
 
  canvas.addEventListener('pointerdown', (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });
 
  window.addEventListener('pointerup', () => {
    isDragging = false;
  });
 
  window.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    targetRotY += deltaX * 0.006;
    targetRotX += deltaY * 0.006;
    lastX = event.clientX;
    lastY = event.clientY;
  });
 
  window.addEventListener('resize', () => {
    const newWidth = parent.clientWidth;
    const newHeight = parent.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
 
  function animate() {
    requestAnimationFrame(animate);
 
    const time = Date.now() * 0.001;
 
    orbGroup.rotation.y += 0.0022 + targetRotY * 0.02;
    orbGroup.rotation.x += 0.0006 + targetRotX * 0.02;
 
    const pulse = 1 + Math.sin(time * 1.6) * 0.18;
    core.scale.set(pulse, pulse, pulse);
    coreMaterial.opacity = 0.4 + Math.sin(time * 1.6) * 0.15;
 
    nodeMaterial.opacity = 0.75 + Math.sin(time * 1.2) * 0.2;
 
    ringOne.rotation.z += 0.003;
    ringTwo.rotation.z -= 0.002;
 
    dataParticles.forEach((particle) => {
      const { radius: orbitRadius, speed, offset, tilt } = particle.userData;
      const angle = time * speed + offset;
 
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      const y = Math.sin(angle * 0.7 + tilt) * orbitRadius * 0.35;
 
      particle.position.set(x, y, z);
    });
 
    renderer.render(scene, camera);
  }
 
  animate();
}
initBackgroundScene();
initAvatarScene();

/* ============================
   AI CHATBOT — FRONTEND LOGIC
   ============================ */

const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
 
if (chatToggle && chatPanel && chatClose && chatForm && chatInput && chatMessages) {
  chatToggle.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) chatInput.focus();
  });
 
  chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
  });
 
  function addMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-message ${sender}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  }
 
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;
 
    addMessage(question, 'user');
    chatInput.value = '';
 
    // Placeholder shown immediately while waiting on the first token
    const botBubble = addMessage('Fetching Info...', 'bot typing');
    const sendButton = chatForm.querySelector('button[type="submit"]');
    if (sendButton) sendButton.disabled = true;
 
    let fullText = '';
    let placeholderCleared = false;
 
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
 
      if (!response.ok || !response.body) {
        throw new Error('Chat request failed');
      }
 
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
 
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
 
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
 
        // Clear the placeholder the instant the first real token arrives
        if (!placeholderCleared) {
          placeholderCleared = true;
          botBubble.classList.remove('typing');
        }
 
        // Render immediately, exactly as it arrives — no artificial delay,
        // this is what makes it feel like a real LLM response
        fullText += chunk;
        botBubble.textContent = fullText;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
 
      if (!fullText.trim()) {
        botBubble.classList.remove('typing');
        botBubble.textContent = "Sorry, I couldn't find an answer to that.";
      }
    } catch (error) {
      botBubble.classList.remove('typing');
      botBubble.textContent = 'Something went wrong reaching the AI. Please try again shortly.';
    } finally {
      if (sendButton) sendButton.disabled = false;
    }
  });
}