import {LitElement, html, css} from 'lit-element';

class BooDialog extends LitElement {

  static get properties() {
    return {
      opened: {type: Boolean, reflect: true},
      shadow: {type: Boolean, reflect: true},
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
      :host([shadow]) {
        -webkit-backdrop-filter: saturate(180%) blur(10px);
        backdrop-filter: saturate(180%) blur(10px);
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
    this.marginVert = 12;
    this.marginHori = 12;
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
    const renderBg = () => {
      if (this.shadow) {
        return html`
          <div class="bg"></div>
        `;
      }
    }
    return html`
      ${renderBg()}
      <slot></slot>
    `;
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

  saveBodyOverflow() {
    if (!window._opened_dialogs || window._opened_dialogs && window._opened_dialogs.length == 0) {
      let body = document.querySelector('body');
      window._old_body_overflow_by_dialog = body.style.overflow;
      window._opened_dialogs = [1];
      body.style.overflow = 'hidden';
    } else {
      window._opened_dialogs.push(1);
    }
  }

  recoveryBodyOverflow() {
    window._opened_dialogs.splice(0, 1);
    if (window._opened_dialogs.length == 0) {
      let body = document.querySelector('body');
      body.style.overflow = window._old_body_overflow_by_dialog;
    }
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
    this.saveBodyOverflow();
    setTimeout(() => {
      this.updateUI();
      this.style.visibility = 'visible';
      this._playWrapperOpenAnimation();
      this._playBgOpenAnimation();
    }, 1);
  }

  _playWrapperOpenAnimation() {
    let wrapper = this.querySelector('[wrapper]');
    if (wrapper && wrapper.animate) {
      wrapper.animate([
        {transform: 'translateY(-10px) scale(0.8)'},
        {transform: 'translateY(0px) scale(1)'}
      ], 300);
    }
  }

  _playBgOpenAnimation() {
    if (this.animate) {
      this.animate([
        {opacity: 0},
        {opacity: 1}
      ], 300);
    }
  }

  _playWrapperCloseAnimation() {
    let wrapper = this.querySelector('[wrapper]');
    if (wrapper && wrapper.animate) {
      wrapper.animate([
        {transform: 'translateY(0px) scale(1)'},
        {transform: 'translateY(-10px) scale(0.8)'}
      ], 300);
    }
  }

  _playBgCloseAnimation() {
    if (this.animate) {
      this.animate([
        {opacity: 1},
        {opacity: 0}
      ], 300);
    }
  }

  _doClose() {
    this.style.display = 'block';
    this.recoveryBodyOverflow();
    if (!this.animate) {
      return new Promise(r => {
        setTimeout(() => {
          this.style.display = 'none';
          this.dispatchEvent(new CustomEvent("closed"));
          r();
        });
      });
    }
    this._playWrapperCloseAnimation();
    this._playBgCloseAnimation();
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
