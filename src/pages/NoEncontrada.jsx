import PortfolioButton from '../components/PortafolioButton.jsx'

function NoEncontrada() {
  return (
    <section className="not-found">
      <p className="section-label">Error 404</p>
      <h1>Esta página no existe.</h1>
      <p>La dirección puede estar mal escrita o la página fue movida.</p>
      <PortfolioButton to="/">
        Volver al inicio
      </PortfolioButton>
    </section>
  )
}

export default NoEncontrada
