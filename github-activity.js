const GITHUB_USERNAME = 'archit7py';

function normalizeContributionWeeks(raw) {
  const source = raw?.contributions ?? raw?.weeks ?? raw?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

  if (!Array.isArray(source)) return [];

  // Flat array of {date, count, level} — pad into weeks aligned to Sunday
  if (source.length && !Array.isArray(source[0]) && !source[0]?.contributionDays && !source[0]?.days) {
    const weeks = [];
    let currentWeek = [];

    source.forEach((day, index) => {
      const dateValue = day?.date ?? '';
      const dayOfWeek = dateValue ? new Date(dateValue).getDay() : index % 7;

      if (index === 0) {
        for (let i = 0; i < dayOfWeek; i++) currentWeek.push(null);
      }

      currentWeek.push({
        date: dateValue,
        contributionCount: Number(day?.count ?? day?.contributionCount ?? 0),
      });

      if (dayOfWeek === 6 || index === source.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }

  return source.map((week) => {
    if (Array.isArray(week)) {
      return week.map((day) => ({
        date: day?.date ?? '',
        contributionCount: Number(day?.count ?? day?.contributionCount ?? 0),
      }));
    }

    if (Array.isArray(week?.contributionDays)) {
      return week.contributionDays.map((day) => ({
        date: day?.date ?? '',
        contributionCount: Number(day?.contributionCount ?? day?.count ?? 0),
      }));
    }

    if (Array.isArray(week?.days)) {
      return week.days.map((day) => ({
        date: day?.date ?? '',
        contributionCount: Number(day?.count ?? day?.contributionCount ?? 0),
      }));
    }

    return [];
  });
}

async function fetchGitHubContributions() {
  // Corrected domain — was pointing to a non-existent host before
  const endpoint = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to load GitHub contributions');
  }

  return response.json();
}

function buildContributionGrid(data) {
  const weeks = normalizeContributionWeeks(data);
  const total = weeks
    .flat()
    .reduce((sum, day) => sum + Number(day?.contributionCount || 0), 0);

  const totalNode = document.getElementById('contribTotal');
  const gridNode = document.getElementById('contributionGrid');

  if (totalNode) totalNode.textContent = total.toLocaleString();
  if (!gridNode) return;

  gridNode.innerHTML = '';

  weeks.forEach((week) => {
    const weekNode = document.createElement('div');
    weekNode.className = 'week';

    week.forEach((day) => {
      const cell = document.createElement('span');

      if (!day) {
        cell.className = 'day level-empty';
        weekNode.appendChild(cell);
        return;
      }

      const count = Number(day?.contributionCount || 0);
      const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;
      cell.className = `day level-${level}`;
      cell.title = `${day?.date || 'Unknown'}: ${count} contributions`;
      weekNode.appendChild(cell);
    });

    gridNode.appendChild(weekNode);
  });
}

async function initGitHubActivity() {
  const totalNode = document.getElementById('contribTotal');
  const gridNode = document.getElementById('contributionGrid');

  if (!totalNode || !gridNode) return;

  try {
    const data = await fetchGitHubContributions();
    buildContributionGrid(data);
  } catch (error) {
    totalNode.textContent = '0';
    gridNode.innerHTML = '<p class="github-error">Unable to load your GitHub activity right now.</p>';
  }
}

initGitHubActivity();