import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { rates as seedRates, type FreightRate } from "./data";
import { isSupabaseConfigured, supabase } from "./supabase";

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const isAdminEmail = (email: string) => adminEmails.includes(email.toLowerCase());

type RateRow = {
  id: string; origin: string; origin_country: string; destination: string; destination_country: string;
  service: string; equipment: string; unit: string; price: number | null; transit: string; updated: string; availability: string;
};
const rowToRate = (row: RateRow): FreightRate => ({
  id: row.id, origin: row.origin, originCountry: row.origin_country, destination: row.destination,
  destinationCountry: row.destination_country, service: row.service as FreightRate["service"],
  equipment: row.equipment, unit: row.unit, price: row.price, transit: row.transit,
  updated: row.updated, availability: row.availability as FreightRate["availability"],
});
const rateToRow = (rate: FreightRate): RateRow => ({
  id: rate.id, origin: rate.origin, origin_country: rate.originCountry, destination: rate.destination,
  destination_country: rate.destinationCountry, service: rate.service, equipment: rate.equipment,
  unit: rate.unit, price: rate.price, transit: rate.transit, updated: rate.updated, availability: rate.availability,
});

export type QuoteRequest = {
  id: string; reference: string; userId: string | null;
  originCountry: string; destinationCountry: string; origin: string; destination: string;
  pickup: string; delivery: string; method: string; loadType: string; equipment: string;
  cargo: string; readyDate: string | null; weight: string; volume: string; pieces: string;
  specialHandling: string; description: string; incoterm: string;
  contactName: string; company: string; email: string; phone: string; notes: string;
  rateId: string | null; status: string; createdAt: string;
};
type RequestRow = {
  id: string; reference: string | null; user_id: string | null;
  origin_country: string | null; destination_country: string | null; origin: string | null; destination: string | null;
  pickup: string | null; delivery: string | null; method: string | null; load_type: string | null; equipment: string | null;
  cargo: string | null; ready_date: string | null; weight: string | null; volume: string | null; pieces: string | null;
  special_handling: string | null; cargo_description: string | null; incoterm: string | null;
  contact_name: string | null; company: string | null; email: string | null; phone: string | null; notes: string | null;
  rate_id: string | null; status: string | null; created_at: string;
};
const rowToRequest = (row: RequestRow): QuoteRequest => ({
  id: row.id, reference: row.reference ?? row.id, userId: row.user_id,
  originCountry: row.origin_country ?? "", destinationCountry: row.destination_country ?? "",
  origin: row.origin ?? "", destination: row.destination ?? "",
  pickup: row.pickup ?? "", delivery: row.delivery ?? "", method: row.method ?? "",
  loadType: row.load_type ?? "", equipment: row.equipment ?? "", cargo: row.cargo ?? "",
  readyDate: row.ready_date, weight: row.weight ?? "", volume: row.volume ?? "", pieces: row.pieces ?? "",
  specialHandling: row.special_handling ?? "", description: row.cargo_description ?? "", incoterm: row.incoterm ?? "",
  contactName: row.contact_name ?? "", company: row.company ?? "", email: row.email ?? "", phone: row.phone ?? "",
  notes: row.notes ?? "", rateId: row.rate_id, status: row.status ?? "Pending Review", createdAt: row.created_at,
});

type Role = "user" | "admin";
export type Session = { id: string; name: string; email: string; role: Role; avatarUrl?: string } | null;
type Notice = { id: number; text: string };
type AuthResult = { ok: boolean; error?: string; needsEmailConfirm?: boolean };

type Store = {
  session: Session;
  configured: boolean;
  savedRoutes: string[];
  rates: FreightRate[];
  requests: QuoteRequest[];
  notices: Notice[];
  authenticate: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  demoLogin: (role?: Role) => void;
  logout: () => void;
  toggleRoute: (id: string) => void;
  saveRate: (rate: FreightRate) => void;
  deleteRate: (id: string) => void;
  createRequest: (data: Record<string, unknown>) => Promise<{ ok: boolean; error?: string; reference: string }>;
  updateRequestStatus: (id: string, status: string) => void;
  notify: (text: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => {
    if (isSupabaseConfigured) return null;
    const saved = localStorage.getItem("arclane-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<string[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem("arclane-routes");
    return saved ? JSON.parse(saved) : [];
  });
  const [rates, setRates] = useState<FreightRate[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem("arclane-rates-v2");
    return saved ? JSON.parse(saved) : seedRates;
  });
  const [notices, setNotices] = useState<Notice[]>([]);

  const notify = (text: string) => {
    setNotices((items) => [...items, { id: Date.now() + Math.random(), text }]);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNotices((items) => items.slice(1));
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [notices]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const profileFromUser = (user: NonNullable<SupabaseSession["user"]>): Session => {
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      return {
        id: user.id,
        email: user.email ?? "",
        name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "Customer"),
        role: meta.role === "admin" || isAdminEmail(user.email ?? "") ? "admin" : "user",
        avatarUrl: meta.avatar_url,
      };
    };

    const applySupabaseSession = (next: SupabaseSession | null) => {
      if (!next?.user) {
        setSession(null);
        return;
      }
      const user = next.user;
      setSession(profileFromUser(user));
      supabase!
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          setSession((prev) =>
            prev && prev.id === user.id
              ? { ...prev, name: (data.full_name as string) || prev.name, role: data.role === "admin" || isAdminEmail(user.email ?? "") ? "admin" : "user" }
              : prev,
          );
        });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (active) applySupabaseSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      window.setTimeout(() => {
        if (active) applySupabaseSession(next);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase
      .from("rates")
      .select("*")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          notify(`Could not load rates: ${error.message}`);
          return;
        }
        if (data) setRates((data as RateRow[]).map(rowToRate));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (!session) {
      setSavedRoutes([]);
      return;
    }
    let active = true;
    supabase
      .from("saved_routes")
      .select("rate_id")
      .eq("user_id", session.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          notify(`Could not load saved routes: ${error.message}`);
          return;
        }
        if (data) setSavedRoutes((data as { rate_id: string }[]).map((row) => row.rate_id));
      });
    return () => {
      active = false;
    };
  }, [session?.id]);

  useEffect(() => {
    if (!supabase) return;
    if (!session) {
      setRequests([]);
      return;
    }
    let active = true;
    supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          notify(`Could not load requests: ${error.message}`);
          return;
        }
        if (data) setRequests((data as RequestRow[]).map(rowToRequest));
      });
    return () => {
      active = false;
    };
  }, [session?.id, session?.role]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    if (session) localStorage.setItem("arclane-session", JSON.stringify(session));
    else localStorage.removeItem("arclane-session");
  }, [session]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem("arclane-rates-v2", JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem("arclane-routes", JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  const authenticate = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: "Supabase is not configured. Add your project keys to enable sign-in." };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { ok: true };

    const message = error.message.toLowerCase();
    if (!message.includes("invalid") && !message.includes("credentials")) {
      return { ok: false, error: error.message };
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: email.split("@")[0], role: "user" } },
    });
    if (signUpError) {
      return {
        ok: false,
        error: signUpError.message.toLowerCase().includes("already")
          ? "That email is already registered. Check your password and try again."
          : signUpError.message,
      };
    }
    if (!data.session) return { ok: true, needsEmailConfirm: true };
    return { ok: true };
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: "Supabase is not configured. Add your project keys to enable Google sign-in." };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  };

  return (
    <StoreContext.Provider
      value={{
        session,
        configured: isSupabaseConfigured,
        savedRoutes,
        rates,
        requests,
        notices,
        authenticate,
        signInWithGoogle,
        demoLogin: (role = "user") => {
          setSession(
            role === "admin"
              ? { id: "demo-admin", name: "Alex Morgan", email: "demo.admin@example.com", role }
              : { id: "demo-user", name: "Jordan Lee", email: "demo.user@example.com", role },
          );
          notify(`Signed in to the ${role === "admin" ? "administrator" : "customer"} demo`);
        },
        logout: () => {
          if (supabase) void supabase.auth.signOut();
          setSession(null);
          notify("You have been signed out");
        },
        toggleRoute: (id) => {
          if (isSupabaseConfigured && !session) {
            notify("Please sign in to save routes to your portal");
            return;
          }
          const alreadySaved = savedRoutes.includes(id);
          setSavedRoutes((items) => (alreadySaved ? items.filter((item) => item !== id) : [...items, id]));
          notify(alreadySaved ? "Route removed from saved routes" : "Route saved to your portal");
          if (supabase && session) {
            if (alreadySaved) {
              supabase
                .from("saved_routes")
                .delete()
                .eq("user_id", session.id)
                .eq("rate_id", id)
                .then(({ error }) => {
                  if (error) notify(`Could not update saved routes: ${error.message}`);
                });
            } else {
              supabase
                .from("saved_routes")
                .insert({ user_id: session.id, rate_id: id })
                .then(({ error }) => {
                  if (error) notify(`Could not save route: ${error.message}`);
                });
            }
          }
        },
        saveRate: (rate) => {
          setRates((items) => {
            const exists = items.some((item) => item.id === rate.id);
            return exists ? items.map((item) => (item.id === rate.id ? rate : item)) : [rate, ...items];
          });
          notify(rates.some((item) => item.id === rate.id) ? `Rate ${rate.id} updated` : `Rate ${rate.id} added`);
          if (supabase) {
            supabase
              .from("rates")
              .upsert(rateToRow(rate), { onConflict: "id" })
              .then(({ error }) => {
                if (error) notify(`Could not save to Supabase: ${error.message}`);
              });
          }
        },
        deleteRate: (id) => {
          setRates((items) => items.filter((item) => item.id !== id));
          notify(`Rate ${id} removed`);
          if (supabase) {
            supabase
              .from("rates")
              .delete()
              .eq("id", id)
              .then(({ error }) => {
                if (error) notify(`Could not delete in Supabase: ${error.message}`);
              });
          }
        },
        createRequest: async (data) => {
          const reference = `RQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          if (!supabase || !session) return { ok: true, reference };
          const { data: inserted, error } = await supabase
            .from("quote_requests")
            .insert({ ...data, user_id: session.id, reference })
            .select()
            .single();
          if (error) return { ok: false, error: error.message, reference };
          if (inserted) setRequests((items) => [rowToRequest(inserted as RequestRow), ...items]);
          return { ok: true, reference };
        },
        updateRequestStatus: (id, status) => {
          setRequests((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
          if (!supabase) {
            notify(`Status updated to ${status}`);
            return;
          }
          supabase
            .from("quote_requests")
            .update({ status })
            .eq("id", id)
            .then(({ error }) => {
              notify(error ? `Could not update status: ${error.message}` : `Status updated to ${status}`);
            });
        },
        notify,
      }}
    >
      {children}
      <div className="toast-stack" aria-live="polite">
        {notices.map((notice) => <div className="toast" key={notice.id}>{notice.text}</div>)}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreProvider is missing");
  return store;
}
