export default async function Home() {
  let games = [];
  try {
    const res = await fetch('http://localhost:3000/games', { cache: 'no-store' });
    games = await res.json();
  } catch(e) {}
  return (
    <main style={{background:'#080C10',minHeight:'100vh',padding:'40px 20px',fontFamily:'sans-serif'}}>
      <h1 style={{color:'#00D4FF',fontSize:32,marginBottom:8}}>Playly</h1>
      <p style={{color:'#8A9BAD',marginBottom:32}}>NYC Sports Platform</p>
      {games.map((g: any) => (
        <div key={g.id} style={{background:'#0E1318',border:'1px solid #1C2730',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{color:'#F0F4F8',fontSize:18,fontWeight:700}}>{g.title}</div>
          <div style={{color:'#8A9BAD',marginTop:4}}>{g.venue}</div>
          <div style={{color:'#00E599',marginTop:8}}>{g.pricePerPlayer === 0 ? 'Free' : '$'+g.pricePerPlayer}</div>
        </div>
      ))}
    </main>
  );
}
