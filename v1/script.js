const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Have found 3000-year-old honey that's still good.",
    source: "https://example.com/honey",
    category: "history",
    votesInteresting: 15,
    votesMindblowing: 5,
    votesFalse: 1,
    createdIn: 2020,
  },
  {
    id: 4,
    text: "Sharks are older than trees.",
    source: "https://example.com/sharks",
    category: "science",
    votesInteresting: 20,
    votesMindblowing: 8,
    votesFalse: 2,
    createdIn: 2022,
  },
];

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

// DOM elements
const btn = document.querySelector(".btn-open");
const form = document.querySelector(".fact-form");
const factsList = document.querySelector("#factsList");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");

// Initial render
renderFacts(initialFacts);

function renderFacts(facts) {
  console.log("Rendering facts:", facts); // Debug log to check facts array
  factsList.innerHTML = "";
  if (facts.length === 0) {
    factsList.innerHTML = "<p>No facts to display.</p>";
  } else {
    facts.forEach((fact) => {
      const html = `
        <li class="fact">
          <p>
            ${fact.text}
            <a class="source" href="${fact.source}" target="_blank">(Source)</a>
          </p>
          <span class="tag" style="background-color: ${CATEGORIES.find((cat) => cat.name === fact.category).color}">${fact.category}</span>
          <div class="vote-buttons">
            <button>👍 ${fact.votesInteresting}</button>
            <button>🤯 ${fact.votesMindblowing}</button>
            <button>⛔️ ${fact.votesFalse}</button>
          </div>
        </li>
      `;
      factsList.insertAdjacentHTML("beforeend", html);
    });
  }
}

// Filter and sort facts
function updateFacts() {
  let facts = [...initialFacts];

  // Filter by search
  const searchQuery = searchInput.value.toLowerCase();
  facts = facts.filter((fact) =>
    fact.text.toLowerCase().includes(searchQuery)
  );

  // Sort by selected option
  const sortBy = sortSelect.value;
  facts.sort((a, b) => b[sortBy] - a[sortBy]);

  renderFacts(facts);
}

searchInput.addEventListener("input", updateFacts);
sortSelect.addEventListener("change", updateFacts);

// Toggle form visibility
btn.addEventListener("click", function () {
  if (form.classList.contains("hidden")) {
    form.classList.remove("hidden");
    btn.textContent = "Close";
  } else {
    form.classList.add("hidden");
    btn.textContent = "Share a fact";
  }
});