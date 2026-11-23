// O servidor responde a lista de planos do cliente em dois formatos:
// { planos: [{ id_pet, produto }] }  ou  { tem_plano, include: produto, id_pet }
export function lerPlanosDoCliente(res: any): { id_pet: number; produto: any }[] {
  if (Array.isArray(res?.planos)) {
    return res.planos.map((p: any) => ({ id_pet: Number(p.id_pet ?? p.pet?.id_pet), produto: p.produto || p.include || p }));
  }
  if (Array.isArray(res)) {
    return res.map((p: any) => ({ id_pet: Number(p.id_pet ?? p.pet?.id_pet), produto: p.produto || p.include || p }));
  }
  if (res?.tem_plano && res?.include) {
    return [{ id_pet: Number(res.id_pet ?? res.include?.id_pet ?? res.pet?.id_pet), produto: res.include }];
  }
  return [];
}
