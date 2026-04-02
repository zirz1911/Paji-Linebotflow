const STORAGE_KEY = "paji_flows";

function loadFlows() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function persistFlows(flows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
}

export function useFlows() {
  const getAll = () => loadFlows();

  const getFlow = (id) => loadFlows().find((f) => f.id === id) || null;

  const createFlow = () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const flow = {
      id,
      name: "Flow ใหม่",
      nodes: [{ id: "node-1", type: "trigger", x: 80, y: 220, data: {} }],
      connections: [],
      knowledgeFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const flows = loadFlows();
    persistFlows([...flows, flow]);
    return id;
  };

  const saveFlow = (id, { nodes, connections, knowledgeFiles, name }) => {
    const flows = loadFlows();
    const idx = flows.findIndex((f) => f.id === id);
    const updated = { id, name, nodes, connections, knowledgeFiles, updatedAt: new Date().toISOString(), createdAt: flows[idx]?.createdAt || new Date().toISOString() };
    if (idx >= 0) flows[idx] = updated;
    else flows.push(updated);
    persistFlows(flows);
  };

  const deleteFlow = (id) => {
    persistFlows(loadFlows().filter((f) => f.id !== id));
  };

  const renameFlow = (id, name) => {
    const flows = loadFlows();
    const idx = flows.findIndex((f) => f.id === id);
    if (idx >= 0) { flows[idx].name = name; flows[idx].updatedAt = new Date().toISOString(); }
    persistFlows(flows);
  };

  return { getAll, getFlow, createFlow, saveFlow, deleteFlow, renameFlow };
}
