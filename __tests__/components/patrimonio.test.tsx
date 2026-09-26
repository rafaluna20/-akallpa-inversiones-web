import { fireEvent, render, screen, within } from '@testing-library/react';

import { ContratosLista } from '@/components/patrimonio/ContratosLista';
import { GraficoPatrimonio } from '@/components/patrimonio/GraficoPatrimonio';
import { NotaPatrimonio, PatrimonioResumen } from '@/components/patrimonio/PatrimonioResumen';
import type { Contrato, Patrimonio } from '@/lib/types';

const contrato = (extra: Partial<Contrato>): Contrato => ({
  proyecto_id: 1, nombre: 'Casa Miraflores', estado: 'en_ejecucion', tipo: 'casa', ubicacion: 'Miraflores', en_curso: true, visible: true,
  comprometido: 10000, aportado: 10000, capital: 10000, porcentaje: 25, utilidad_recibida: 0, resultado: 0, avance_pct: 35,
  roi_estimado: null, ganancia_estimada: null, ...extra,
});

const base: Patrimonio = {
  moneda: 'PEN', hoy: '2026-09-26', patrimonio: 12337.89, saldo_libre: 5051.47, capital_en_curso: 7286.42, puesto: 11000,
  utilidad_mes: 111.49, utilidad_recibida: 1337.9, resultado_realizado: 1337.9, proyectos_activos: 2, proyectos_historicos: 3,
  evolucion: [
    { fecha: '2026-07-31', patrimonio: 11000, puesto: 11000 },
    { fecha: '2026-08-31', patrimonio: 12226.4, puesto: 11000 },
    { fecha: '2026-09-26', patrimonio: 12337.89, puesto: 11000 },
  ],
  contratos: [], otras_monedas: false,
};

describe('PatrimonioResumen', () => {
  test('muestra el patrimonio, las cifras clave y la utilidad del mes', () => {
    render(<PatrimonioResumen datos={base} />);
    expect(screen.getByLabelText(/Patrimonio total/)).toHaveTextContent(/12[\s.,]?337[.,]89/);
    const cifras = screen.getByRole('region', { name: 'Cifras clave' });
    expect(within(cifras).getByText('Capital en curso').parentElement).toHaveTextContent(/7[\s.,]?286[.,]42/);
    expect(within(cifras).getByText('Saldo disponible').parentElement).toHaveTextContent(/5[\s.,]?051[.,]47/);
    expect(within(cifras).getByText('Proyectos activos').parentElement).toHaveTextContent('Histórico: 3');
    expect(screen.getByText(/de utilidad recibida este mes/)).toHaveTextContent(/\+/);
  });

  test('sin utilidad este mes lo dice en vez de mostrar +0', () => {
    render(<PatrimonioResumen datos={{ ...base, utilidad_mes: 0 }} />);
    expect(screen.getByText('Sin utilidad recibida este mes')).toBeInTheDocument();
  });

  test('una pérdida en proyectos cerrados se ve con signo negativo y en rojo', () => {
    render(<PatrimonioResumen datos={{ ...base, utilidad_recibida: 0, resultado_realizado: -5000 }} />);
    expect(screen.getByText(/Resultado en proyectos cerrados: −/)).toBeInTheDocument();
  });

  test('la barra de reparto indica cuánto está invertido y cuánto disponible', () => {
    render(<PatrimonioResumen datos={base} />);
    expect(screen.getByRole('img', { name: '59% invertido y 41% disponible' })).toBeInTheDocument();
  });

  test('avisa si hay cuentas en otra moneda', () => {
    render(<PatrimonioResumen datos={{ ...base, otras_monedas: true }} />);
    expect(screen.getByText(/Tienes cuentas en otra moneda: aquí solo se muestra PEN/)).toBeInTheDocument();
  });

  test('tiene accesos a depositar y a invertir', () => {
    render(<PatrimonioResumen datos={base} />);
    expect(screen.getByRole('link', { name: /Depositar/ })).toHaveAttribute('href', '/cuenta/depositar');
    expect(screen.getByRole('link', { name: /Nueva inversión/ })).toHaveAttribute('href', '/oportunidades');
  });

  test('la nota explica que es a costo y que las estimaciones no son promesas', () => {
    render(<NotaPatrimonio />);
    expect(screen.getByText(/a costo/)).toBeInTheDocument();
    expect(screen.getByText(/no promesas/)).toBeInTheDocument();
  });
});

describe('GraficoPatrimonio', () => {
  test('con un solo mes no dibuja nada', () => {
    const { container } = render(<GraficoPatrimonio puntos={base.evolucion.slice(0, 1)} moneda="PEN" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('dibuja las dos líneas y ofrece la tabla equivalente para lectores de pantalla', () => {
    const { container } = render(<GraficoPatrimonio puntos={base.evolucion} moneda="PEN" />);
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
    expect(screen.getByText('Lo que pusiste (depósitos − retiros)', { selector: 'span' })).toBeInTheDocument();
    const tabla = container.querySelector('table.sr-only') as HTMLElement;
    expect(within(tabla).getAllByRole('row')).toHaveLength(4);
  });
});

describe('ContratosLista', () => {
  const contratos = [
    contrato({ proyecto_id: 1, nombre: 'Casa Miraflores' }),
    contrato({ proyecto_id: 2, nombre: 'Multifamiliar Olivos', estado: 'liquidado', en_curso: false, capital: 0, aportado: 50000, utilidad_recibida: 45000, resultado: 45000, avance_pct: 100 }),
  ];

  test('abre en «En curso» y cambia de pestaña', () => {
    render(<ContratosLista contratos={contratos} moneda="PEN" />);
    expect(screen.getByText('Casa Miraflores')).toBeInTheDocument();
    expect(screen.queryByText('Multifamiliar Olivos')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Finalizados' }));
    expect(screen.getByText('Multifamiliar Olivos')).toBeInTheDocument();
    expect(screen.queryByText('Casa Miraflores')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Todos' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  test('un contrato finalizado muestra su resultado final con signo', () => {
    render(<ContratosLista contratos={contratos} moneda="PEN" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Finalizados' }));
    const tarjeta = screen.getByRole('article');
    expect(within(tarjeta).getByText('Resultado final').nextSibling).toHaveTextContent(/^\+/);
    expect(within(tarjeta).queryByText('Avance de obra')).not.toBeInTheDocument();
  });

  test('una pérdida final se muestra con signo menos', () => {
    render(<ContratosLista contratos={[contrato({ en_curso: false, estado: 'liquidado', resultado: -5000, aportado: 50000, capital: 0 })]} moneda="PEN" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Finalizados' }));
    expect(screen.getByText('Resultado final').nextSibling).toHaveTextContent(/^−/);
  });

  test('un contrato en curso muestra el avance de obra y enlaza a su ficha', () => {
    render(<ContratosLista contratos={contratos} moneda="PEN" />);
    expect(screen.getByRole('progressbar', { name: /Avance de obra de Casa Miraflores/ })).toHaveAttribute('aria-valuenow', '35');
    expect(screen.getByRole('link', { name: 'Casa Miraflores' })).toHaveAttribute('href', '/proyectos/1');
  });

  test('si el proyecto ya no está publicado no se enlaza a una ficha inexistente', () => {
    render(<ContratosLista contratos={[contrato({ visible: false })]} moneda="PEN" />);
    expect(screen.queryByRole('link', { name: 'Casa Miraflores' })).not.toBeInTheDocument();
    expect(screen.getByText('Casa Miraflores')).toBeInTheDocument();
  });

  test('la ganancia estimada se presenta como proyección, nunca como ganancia', () => {
    render(<ContratosLista contratos={[contrato({ roi_estimado: 15, ganancia_estimada: 1500 })]} moneda="PEN" />);
    expect(screen.getByText(/Estimación del gestor/)).toHaveTextContent(/no una promesa ni una ganancia recibida/);
  });

  test('sin estimación no aparece ningún aviso de ganancia', () => {
    render(<ContratosLista contratos={[contrato({})]} moneda="PEN" />);
    expect(screen.queryByText(/Estimación del gestor/)).not.toBeInTheDocument();
  });

  test('un aporte por confirmar se avisa y no se cuenta como capital', () => {
    render(<ContratosLista contratos={[contrato({ comprometido: 10000, aportado: 4000, capital: 4000 })]} moneda="PEN" />);
    expect(screen.getByText(/por confirmar/)).toHaveTextContent(/6[\s.,]?000/);
  });

  test('sin contratos en una pestaña lo explica', () => {
    render(<ContratosLista contratos={[contrato({})]} moneda="PEN" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Finalizados' }));
    expect(screen.getByText('Todavía no tienes contratos finalizados')).toBeInTheDocument();
  });
});
