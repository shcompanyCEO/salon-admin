import { create } from 'zustand';
import { Salon, Designer, Service } from '@/types';

interface SalonState {
  currentSalon: Salon | null;
  designers: Designer[];
  services: Service[];
  setCurrentSalon: (salon: Salon | null) => void;
  setDesigners: (designers: Designer[]) => void;
  setServices: (services: Service[]) => void;
  addDesigner: (designer: Designer) => void;
  updateDesigner: (id: string, data: Partial<Designer>) => void;
  removeDesigner: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  removeService: (id: string) => void;
}

export const useSalonStore = create<SalonState>((set) => ({
  currentSalon: null,
  designers: [],
  services: [],

  setCurrentSalon: (salon) => set({ currentSalon: salon }),

  setDesigners: (designers) => set({ designers }),

  setServices: (services) => set({ services }),

  addDesigner: (designer) =>
    set((state) => ({
      designers: [...state.designers, designer],
    })),

  updateDesigner: (id, data) =>
    set((state) => ({
      designers: state.designers.map((d) =>
        d.id === id ? { ...d, ...data } : d
      ),
    })),

  removeDesigner: (id) =>
    set((state) => ({
      designers: state.designers.filter((d) => d.id !== id),
    })),

  addService: (service) =>
    set((state) => ({
      services: [...state.services, service],
    })),

  updateService: (id, data) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),

  removeService: (id) =>
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    })),
}));
