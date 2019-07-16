import {LitElement, html, css} from 'lit-element';

class BooDialog extends LitElement {

  static get properties() {
    return {
      opened: {type: Boolean, reflect: true},
      noAutoClose: {type: Boolean, reflect: true, attribute: 'no-auto-close'},
      marginVert: {type: Number, reflect: true, attribute: 'margin-vert'},
      marginHori: {type: Number, reflect: true, attribute: 'margin-hori'}
    }
  }

  static get styles() {
    return css`
      :host {
        width: 100vw;
        height: 100vh;
        left: 0px;
        top: 0px;
        position: fixed;
        z-index: 100000;
        display: none;
      }
      :host([opened]) {
        display: block;
      }
      ::slotted([wrapper]) {
        display: block;
        z-index: 100001;
        position: fixed;
        outline: none;
        box-sizing: border-box;
        color: inherit;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                    0  6px 30px 5px rgba(0, 0, 0, 0.12),
                    0  8px 10px -5px rgba(0, 0, 0, 0.4);
      }
    `;
  }

  constructor() {
    super();
    this.marginVert = 0;
    this.marginHori = 0;
    this.noAutoClose = false;
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent("click-dialog-out"));
      if (!this.noAutoClose) {
        this.close();
      }
    });
  }


  attributeChangedCallback(name, old, val) {
    super.attributeChangedCallback(name, old, val);
    if (name != 'opened' || old == val) {
      return;
    }
    if (this.opened) {
      this._doOpen();
      return;
    }
    this._doClose();
  }

  render() {
    return html`<slot></slot>`;
  }

  firstUpdated() {
    super.firstUpdated();
    let wrapper = this.querySelector('[wrapper]');
    wrapper.addEventListener('click', e => e.stopPropagation());
  }

  open() {
    if (this.opened) {
      return new Promise(r => r());
    }
    this.opened = true;
    return new Promise(r => {
      setTimeout(() => r(), 300);
    });
  }

  updateUI() {
    let wrapper = this.querySelector('[wrapper]');
    let r = this.getBoundingClientRect();
    wrapper.style.maxHeight = r.height - 2 * this.marginVert + 'px';
    wrapper.style.maxWidth = r.width - 2 * this.marginHori + 'px';
    let wr = wrapper.getBoundingClientRect();
    wrapper.style.left = (r.width - wr.width) / 2 + 'px';
    wrapper.style.top = (r.height - wr.height) / 2 + 'px';
  }

  _doOpen() {
    this.style.display = 'block';
    this.style.visibility = 'hidden';
    setTimeout(() => {
      this.updateUI();
      this.style.visibility = 'visible';
      if (this.animate) {
        this.animate([
          {opacity: 0, transform: 'translateY(-10px) scale(0.8)'},
          {opacity: 1, transform: 'translateY(0px) scale(1)'}
        ], 300);
      }
    }, 1);
  }

  _doClose() {
    this.style.display = 'block';
    if (!this.animate) {
      return new Promise(r => r());
    }
    this.animate([
      {opacity: 1, transform: 'translateY(0px) scale(1)'},
      {opacity: 0, transform: 'translateY(-10px) scale(0.8)'}
    ], 300);
    return new Promise(r => {
      setTimeout(() => {
        this.style.display = 'none';
        this.dispatchEvent(new CustomEvent("closed"));
        r();
      }, 280);
    });
  }

  close() {
    if (!this.opened) {
      return new Promise(r => r());
    }
    this.opened = false;
    return new Promise(r => {
      setTimeout(() => r(), 300);
    });
  }
};

export const dialogStyles = css`
  [wrapper]>* {
    margin-top: 20px;
    padding: 0 24px;
  }
  [wrapper]>.no-margin {
    margin: 0;
  }
  [wrapper]>.no-padding {
    padding: 0;
  }
  [wrapper]>*:first-child {
    margin-top: 24px;
  }
  [wrapper]>*:last-child {
    margin-bottom: 24px;
  }
`;

customElements.define('boo-dialog', BooDialog);
