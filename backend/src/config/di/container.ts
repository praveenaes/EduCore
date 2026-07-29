import "reflect-metadata";
import { Container } from "inversify";
import { coreModule } from "./modules/coreModule";
import { useCaseModule } from "./modules/useCaseModule";
import { controllerModule } from "./modules/controllerModule";

const container = new Container();

container.load(
  coreModule,
  useCaseModule,
  controllerModule,
);

export { container };
