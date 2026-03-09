import { Button } from 'antd'

function App() {
  const handleClick = () => {
    console.log('Button clicked!!')
  }
  return (
    <div>
      <Button type="dashed" onClick={handleClick}>Click me</Button>
    </div>
  )
}

export default App
