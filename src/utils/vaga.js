const toSlug = (name = "") =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

export function getModalidadeVaga(job) {
  if (!job) return "";
  if (job.workModel) return job.workModel;
  if (job.contractType?.includes("Remoto")) return "Remoto";
  if (job.locationRequired === false) return "Remoto";
  if (job.locationRequired === true) return "Presencial";
  return "A combinar";
}

export function buildVagaData(job) {
  if (!job) return null;
  const titulo = job.title || job.name || "";
  return {
    nomeVaga: titulo,
    cidade: job.city || "",
    modalidade: getModalidadeVaga(job),
    linkVaga: `https://loglabdigital.inhire.app/vagas/${job.id}/${toSlug(titulo)}`,
  };
}

export function hasVagaVariables(text) {
  return /\[NomeVaga\]|\[Cidade\]|\[Modalidade\]|\[LinkVaga\]/.test(text || "");
}