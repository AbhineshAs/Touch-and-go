"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput, Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/States";
import { TaxonomyItem } from "@/types";
import { getTaxonomy, addTaxonomyItem, deprecateTaxonomyItem } from "@/lib/api/admin";
import { Tags, Plus, Search, Archive, CheckCircle2 } from "lucide-react";

export default function AdminTaxonomyPage() {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Add modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<TaxonomyItem["type"]>("Skill");
  const [aliases, setAliases] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getTaxonomy();
      setItems(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const newItem = await addTaxonomyItem({
      name,
      type,
      aliases: aliases.split(",").map((s) => s.trim()),
    });
    setItems([newItem, ...items]);
    setIsAdding(false);
    setIsAddOpen(false);
    setName("");
    setAliases("");
  };

  const handleDeprecate = async (id: string) => {
    const updated = await deprecateTaxonomyItem(id);
    setItems(items.map((i) => (i.id === updated.id ? updated : i)));
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return <LoadingState message="Loading skills and ontology taxonomy..." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Marketplace Taxonomy ({items.length})
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage canonical skills, aliases, job titles, and locations. Deprecated entities maintain historical references.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Taxonomy Node
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <SearchInput
            placeholder="Search canonical name or aliases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Skill", "Job Title", "Location"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === t
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-secondary hover:bg-background"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Canonical Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Aliases</th>
                <th className="p-4">Active Profile Uses</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4 font-bold text-text-primary">{item.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-border-subtle font-medium text-[11px]">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-text-muted">
                    {item.aliases.length > 0 ? item.aliases.join(", ") : "None"}
                  </td>
                  <td className="p-4 font-mono font-semibold">{item.usageCount.toLocaleString()}</td>
                  <td className="p-4">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === "Active"
                          ? "bg-success-soft text-success"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {item.status === "Active" ? (
                      <button
                        onClick={() => handleDeprecate(item.id)}
                        className="text-xs text-amber-700 hover:text-amber-900 hover:underline font-semibold cursor-pointer"
                        title="Deprecate instead of hard-deleting"
                      >
                        Deprecate
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-muted">Deprecated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD TAXONOMY MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Taxonomy Node"
        description="Add a canonical skill, standard job title, or location mapping."
        size="sm"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 text-xs">
          <Input
            label="Canonical Entity Name"
            placeholder="e.g. Next.js, Kubernetes, Kochi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-text-secondary">Node Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="Skill">Skill</option>
              <option value="Job Title">Job Title</option>
              <option value="Location">Location</option>
              <option value="Industry">Industry</option>
            </select>
          </div>

          <Input
            label="Recognized Aliases (Comma separated)"
            placeholder="e.g. NextJS, Next 16, Next"
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isAdding}>
              Save Node
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
