export const mockDocs = [
  { id: "1", title: "Q4 Financial Report 2025.pdf", size: "2.4 MB", lastOpened: "2 hours ago", pages: 42, starred: true },
  { id: "2", title: "Product Roadmap — Winter.pdf", size: "1.1 MB", lastOpened: "Yesterday", pages: 18 },
  { id: "3", title: "Employee Handbook v3.pdf", size: "4.8 MB", lastOpened: "3 days ago", pages: 96, starred: true },
  { id: "4", title: "Design System Guidelines.pdf", size: "6.2 MB", lastOpened: "Last week", pages: 128 },
  { id: "5", title: "Legal Contract — NDA.pdf", size: "312 KB", lastOpened: "2 weeks ago", pages: 6 },
  { id: "6", title: "Market Research 2025.pdf", size: "3.7 MB", lastOpened: "3 weeks ago", pages: 54 },
  { id: "7", title: "Old Meeting Notes.pdf", size: "220 KB", lastOpened: "1 month ago", pages: 8, trashed: true },
  { id: "8", title: "Draft Proposal — v1.pdf", size: "1.9 MB", lastOpened: "2 months ago", pages: 22, trashed: true },
];

export const docById = (id) => mockDocs.find((d) => d.id === id);
