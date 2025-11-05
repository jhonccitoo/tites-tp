import { useEffect, useState } from "react";
import { Card, Button, Badge } from "react-bootstrap";

// Si tu backend quedó montado en /api/cambio (singular), cambia esta constante.
const CAMBIOS_BASE = "/api/cambios";

export default function BandejaCambios({ role }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${CAMBIOS_BASE}/inbox?role=${encodeURIComponent(role)}`);
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando bandeja:", e);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeidos = async (ids) => {
    try {
      await fetch(`${CAMBIOS_BASE}/inbox/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      // Refrescar después de marcar
      cargar();
    } catch (e) {
      console.error("Error marcando leídos:", e);
    }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 8000); // polling simple cada 8s
    return () => clearInterval(id);
  }, [role]);

  const noLeidos = items.filter(i => !i.read).length;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">
            Solicitudes de Cambio{" "}
            {noLeidos > 0 && (
              <Badge bg="warning" text="dark">{noLeidos} nuevo(s)</Badge>
            )}
          </h5>
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-secondary" onClick={cargar} disabled={loading}>
              {loading ? "Actualizando…" : "Actualizar"}
            </Button>
            {noLeidos > 0 && (
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => marcarLeidos(items.filter(i => !i.read).map(i => i.id))}
              >
                Marcar leídos
              </Button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-muted">Sin solicitudes.</div>
        ) : (
          items.map(n => (
            <div key={n.id} className="border rounded p-2 mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <strong>{n.title}</strong>
                {!n.read ? <Badge bg="warning" text="dark">NUEVO</Badge> : <Badge bg="secondary">leído</Badge>}
              </div>
              <div className="small text-muted">{new Date(n.createdAt).toLocaleString()}</div>
              <div className="mt-1">{n.message}</div>
              {n.data?.motivo ? (
                <div className="mt-2">
                  <em>Motivo:</em> {n.data.motivo}
                </div>
              ) : null}
              <div className="mt-2 small text-muted">
                {n.data?.groupName ? `Grupo: ${n.data.groupName}` : null}
                {n.data?.tesistaFullName ? ` · Tesista: ${n.data.tesistaFullName}` : null}
              </div>
              {!n.read && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => marcarLeidos([n.id])}
                  >
                    Marcar como leído
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </Card.Body>
    </Card>
  );
}
