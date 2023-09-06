import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { TabsContainerComponent } from './tabs-container.component';
import { By } from '@angular/platform-browser';

// for nested components we must create dummy component for loading nested components with projected content
@Component(
  {
    template: `
    <app-tabs-container>
        <app-tab tabTitle="Tab 1"> Tab 1 test </app-tab>
        <app-tab tabTitle="Tab 2"> Tab 2 test </app-tab>
    </app-tabs-container>
    `
  })
class TestHostComponent {

}

describe('TabsContainerComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsContainerComponent, TestHostComponent, TabComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 2 tabs', () => {
    const tabs = fixture.debugElement.queryAll(By.css('li'));// all elements that are list (have li in html)
    const containerComponent = fixture.debugElement.query(By.directive(TabsContainerComponent));// query(By.directive()) to get the whole component
    const containerProp = containerComponent.componentInstance.tabs; // get the instance of the tabs value

    expect(tabs.length).withContext("Tabs did not rendered").toBe(2);
    expect(containerProp.length).withContext("Could not grab component property").toBe(2);
  });
});
