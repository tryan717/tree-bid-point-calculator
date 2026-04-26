const POINTS = {
  treeSize: {
    "": 0,
    S: 6,
    M: 10,
    L: 16,
    XL: 23
  },
  canopySize: {
    "": 0,
    S: 1,
    M: 3,
    L: 4,
    XL: 6
  }
};

const STORAGE_KEY = "sticks-n-stones-point-calculator-jobs-v1";

const els = {
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  jobAddress: document.getElementById("jobAddress"),
  pricePerPoint: document.getElementById("pricePerPoint"),
  accessDifficulty: document.getElementById("accessDifficulty"),
  haulOff: document.getElementById("haulOff"),
  equipment: document.getElementById("equipment"),
  craneAddon: document.getElementById("craneAddon"),
  noHaulDiscount: document.getElementById("noHaulDiscount"),
  manualAddon: document.getElementById("manualAddon"),
  estimateNotes: document.getElementById("estimateNotes"),
  grandTotal: document.getElementById("grandTotal"),
  pointSummary: document.getElementById("pointSummary"),
  treeList: document.getElementById("treeList"),
  treeTemplate: document.getElementById("treeTemplate"),
  savedJobsSection: document.getElementById("savedJobsSection"),
  savedJobs: document.getElementById("savedJobs")
};

document.getElementById("addTreeBtn").addEventListener("click", () => addTree());
document.getElementById("saveJobBtn").addEventListener("click", saveJob);
document.getElementById("loadJobsBtn").addEventListener("click", renderSavedJobs);
document.getElementById("pdfBtn").addEventListener("click", createPdf);
document.getElementById("emailBtn").addEventListener("click", emailEstimate);
document.getElementById("resetBtn").addEventListener("click", resetCalculator);

[
  els.customerName,
  els.customerPhone,
  els.jobAddress,
  els.pricePerPoint,
  els.accessDifficulty,
  els.haulOff,
  els.equipment,
  els.craneAddon,
  els.noHaulDiscount,
  els.manualAddon,
  els.estimateNotes
].forEach(el => el.addEventListener("input", calculate));

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function addTree(data = null) {
  const node = els.treeTemplate.content.cloneNode(true);
  const card = node.querySelector(".tree-card");
  els.treeList.appendChild(node);

  const treeCard = els.treeList.lastElementChild;
  const fields = getTreeFields(treeCard);

  if (data) {
    fields.size.value = data.size ?? "";
    fields.canopy.value = data.canopy ?? "";
    fields.risk.value = data.risk ?? "0";
    fields.rigging.value = data.rigging ?? "0";
    fields.logs.value = data.logs ?? "0";
    fields.qty.value = data.qty ?? "1";
  }

  treeCard.querySelector(".remove-tree").addEventListener("click", () => {
    treeCard.remove();
    renumberTrees();
    calculate();
  });

  Object.values(fields).forEach(field => field.addEventListener("input", calculate));

  renumberTrees();
  calculate();
}

function getTreeFields(card) {
  return {
    size: card.querySelector(".tree-size"),
    canopy: card.querySelector(".canopy-size"),
    risk: card.querySelector(".risk"),
    rigging: card.querySelector(".rigging"),
    logs: card.querySelector(".logs"),
    qty: card.querySelector(".tree-qty")
  };
}

function getTrees() {
  return [...els.treeList.querySelectorAll(".tree-card")].map(card => {
    const fields = getTreeFields(card);
    return {
      size: fields.size.value,
      canopy: fields.canopy.value,
      risk: fields.risk.value,
      rigging: fields.rigging.value,
      logs: fields.logs.value,
      qty: fields.qty.value
    };
  });
}

function treePoints(tree) {
  const base =
    numberValue(POINTS.treeSize[tree.size]) +
    numberValue(POINTS.canopySize[tree.canopy]) +
    numberValue(tree.risk) +
    numberValue(tree.rigging) +
    numberValue(tree.logs);

  return base * Math.max(1, numberValue(tree.qty));
}

function calculate() {
  const treeCards = [...els.treeList.querySelectorAll(".tree-card")];
  let treeTotalPoints = 0;

  treeCards.forEach(card => {
    const tree = {
      size: card.querySelector(".tree-size").value,
      canopy: card.querySelector(".canopy-size").value,
      risk: card.querySelector(".risk").value,
      rigging: card.querySelector(".rigging").value,
      logs: card.querySelector(".logs").value,
      qty: card.querySelector(".tree-qty").value
    };

    const subtotal = treePoints(tree);
    treeTotalPoints += subtotal;
    card.querySelector(".tree-points").textContent = `${subtotal} pts`;
  });

  const jobPoints =
    numberValue(els.accessDifficulty.value) +
    numberValue(els.haulOff.value) +
    numberValue(els.equipment.value);

  const totalPoints = treeTotalPoints + jobPoints;
  const pricePerPoint = numberValue(els.pricePerPoint.value);

  const pointSubtotal = totalPoints * pricePerPoint;
  const discounted = Math.max(0, pointSubtotal - numberValue(els.noHaulDiscount.value));
  const total = discounted + numberValue(els.craneAddon.value) + numberValue(els.manualAddon.value);

  els.grandTotal.textContent = money(total);
  els.pointSummary.textContent = `${totalPoints} pts × ${money(pricePerPoint)}/pt`;

  return {
    treeTotalPoints,
    jobPoints,
    totalPoints,
    pricePerPoint,
    pointSubtotal,
    noHaulDiscount: numberValue(els.noHaulDiscount.value),
    craneAddon: numberValue(els.craneAddon.value),
    manualAddon: numberValue(els.manualAddon.value),
    total
  };
}

function renumberTrees() {
  [...els.treeList.querySelectorAll(".tree-card")].forEach((card, i) => {
    card.querySelector("h3").textContent = `Tree ${i + 1}`;
  });
}

function getJobData() {
  const totals = calculate();

  return {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    customerName: els.customerName.value.trim(),
    customerPhone: els.customerPhone.value.trim(),
    jobAddress: els.jobAddress.value.trim(),
    pricePerPoint: els.pricePerPoint.value,
    accessDifficulty: els.accessDifficulty.value,
    haulOff: els.haulOff.value,
    equipment: els.equipment.value,
    craneAddon: els.craneAddon.value,
    noHaulDiscount: els.noHaulDiscount.value,
    manualAddon: els.manualAddon.value,
    estimateNotes: els.estimateNotes.value.trim(),
    trees: getTrees(),
    totals
  };
}

function setJobData(job) {
  els.customerName.value = job.customerName || "";
  els.customerPhone.value = job.customerPhone || "";
  els.jobAddress.value = job.jobAddress || "";
  els.pricePerPoint.value = job.pricePerPoint || "125";
  els.accessDifficulty.value = job.accessDifficulty || "0";
  els.haulOff.value = job.haulOff || "0";
  els.equipment.value = job.equipment || "0";
  els.craneAddon.value = job.craneAddon || "0";
  els.noHaulDiscount.value = job.noHaulDiscount || "0";
  els.manualAddon.value = job.manualAddon || "0";
  els.estimateNotes.value = job.estimateNotes || "";

  els.treeList.innerHTML = "";
  if (job.trees?.length) {
    job.trees.forEach(tree => addTree(tree));
  } else {
    addTree();
  }

  calculate();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadSavedJobs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function storeSavedJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function saveJob() {
  const job = getJobData();
  const jobs = loadSavedJobs();
  jobs.unshift(job);
  storeSavedJobs(jobs);
  renderSavedJobs();
  alert("Job saved on this device/browser.");
}

function renderSavedJobs() {
  const jobs = loadSavedJobs();
  els.savedJobsSection.classList.remove("hidden");

  if (!jobs.length) {
    els.savedJobs.innerHTML = "<p>No saved jobs yet.</p>";
    return;
  }

  els.savedJobs.innerHTML = jobs.map(job => {
    const name = job.customerName || "Unnamed customer";
    const address = job.jobAddress || "No address";
    const date = new Date(job.savedAt).toLocaleString();
    return `
      <div class="saved-job">
        <strong>${escapeHtml(name)} — ${money(job.totals?.total || 0)}</strong>
        <span>${escapeHtml(address)}</span><br />
        <small>Saved ${date}</small>
        <div class="saved-actions">
          <button class="small" data-load="${job.id}">Load</button>
          <button class="small danger" data-delete="${job.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  els.savedJobs.querySelectorAll("[data-load]").forEach(btn => {
    btn.addEventListener("click", () => {
      const job = loadSavedJobs().find(j => j.id === btn.dataset.load);
      if (job) setJobData(job);
    });
  });

  els.savedJobs.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const jobs = loadSavedJobs().filter(j => j.id !== btn.dataset.delete);
      storeSavedJobs(jobs);
      renderSavedJobs();
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function estimateText(job) {
  const lines = [];
  lines.push("Sticks 'N Stones Tree & Grading");
  lines.push("Tree Removal Estimate");
  lines.push("");
  lines.push(`Customer: ${job.customerName || ""}`);
  lines.push(`Phone: ${job.customerPhone || ""}`);
  lines.push(`Address: ${job.jobAddress || ""}`);
  lines.push("");
  lines.push(`Total Points: ${job.totals.totalPoints}`);
  lines.push(`Price Per Point: ${money(job.totals.pricePerPoint)}`);
  lines.push(`Point Subtotal: ${money(job.totals.pointSubtotal)}`);
  lines.push(`No Haul-Off Discount: -${money(job.totals.noHaulDiscount)}`);
  lines.push(`Crane Add-On: ${money(job.totals.craneAddon)}`);
  lines.push(`Manual Add-On: ${money(job.totals.manualAddon)}`);
  lines.push("");
  lines.push(`Estimated Total: ${money(job.totals.total)}`);
  lines.push("");
  lines.push("Tree Details:");
  job.trees.forEach((tree, index) => {
    lines.push(`Tree ${index + 1}: Size ${tree.size || "blank"}, Canopy ${tree.canopy || "blank"}, Risk ${tree.risk} pts, Rigging ${tree.rigging} pts, Logs ${tree.logs} pts, Qty ${tree.qty}, Subtotal ${treePoints(tree)} pts`);
  });
  lines.push("");
  lines.push("Notes:");
  lines.push(job.estimateNotes || "");
  lines.push("");
  lines.push("This estimate is based on visible conditions at the time of inspection and may change if site conditions, scope, or customer requests change.");
  return lines;
}

function createPdf(returnBlob = false) {
  const job = getJobData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Sticks 'N Stones Tree & Grading", 14, y);

  y += 8;
  doc.setFontSize(14);
  doc.text("Tree Removal Estimate", 14, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  estimateText(job).slice(3).forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 18;
    }
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 6;
  });

  const safeName = (job.customerName || "tree-estimate").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const filename = `${safeName || "tree-estimate"}.pdf`;

  if (returnBlob) {
    return { blob: doc.output("blob"), filename, job };
  }

  doc.save(filename);
}

async function emailEstimate() {
  const { blob, filename, job } = createPdf(true);
  const subject = encodeURIComponent(`Tree Removal Estimate${job.customerName ? " - " + job.customerName : ""}`);
  const body = encodeURIComponent(
    `Hello,\n\nAttached/linked is the tree removal estimate.\n\nEstimated total: ${money(job.totals.total)}\n\nThank you,\nSticks 'N Stones Tree & Grading`
  );

  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "application/pdf" })] })) {
    const file = new File([blob], filename, { type: "application/pdf" });
    await navigator.share({
      title: "Tree Removal Estimate",
      text: `Estimated total: ${money(job.totals.total)}`,
      files: [file]
    });
  } else {
    alert("Your browser may not attach PDFs directly to email. The PDF will download first, then your email app will open.");
    createPdf(false);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

function resetCalculator() {
  if (!confirm("Reset this estimate?")) return;

  els.customerName.value = "";
  els.customerPhone.value = "";
  els.jobAddress.value = "";
  els.pricePerPoint.value = "125";
  els.accessDifficulty.value = "0";
  els.haulOff.value = "0";
  els.equipment.value = "0";
  els.craneAddon.value = "0";
  els.noHaulDiscount.value = "0";
  els.manualAddon.value = "0";
  els.estimateNotes.value = "";
  els.treeList.innerHTML = "";
  addTree();
}

addTree();
calculate();
