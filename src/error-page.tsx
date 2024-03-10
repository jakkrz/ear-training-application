import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return <h1>Sorry, an unexpected error occured (see console).</h1>
}
